package com.example.be.service;

import com.example.be.dto.CustomUserDetail;
import com.example.be.dto.request.*;
import com.example.be.dto.response.*;
import com.example.be.entity.*;
import com.example.be.enums.Role;
import com.example.be.enums.UserEventType;
import com.example.be.exception.*;
import com.example.be.repository.*;
import com.example.be.util.PasswordGenerator;
import com.example.be.util.SecurityUtil;
import com.example.be.util.TokenUtil;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final TokenUtil tokenUtil;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailService emailService;
    private final UserEventService userEventService;
    private final UserEventRepository userEventRepository;
    private final UserCaseProgressRepository userCaseProgressRepository;

    private final PasswordResetTokenRepository passwordResetTokenRepository;

    UserService(UserRepository userRepository,
                TokenUtil tokenUtil,
                PasswordEncoder passwordEncoder,
                RefreshTokenRepository refreshTokenRepository,
                RefreshTokenService refreshTokenService,
                EmailService emailService,
                UserEventService userEventService,
                UserEventRepository userEventRepository,
                UserCaseProgressRepository userCaseProgressRepository,
                PasswordResetTokenRepository passwordResetTokenRepository) {

        this.userRepository = userRepository;
        this.tokenUtil = tokenUtil;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
        this.userEventService = userEventService;
        this.userEventRepository = userEventRepository;
        this.userCaseProgressRepository = userCaseProgressRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
    }

    @Transactional
    public RegisterResponse createUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.username())) {
            throw new UsernameAlreadyExistsException("Username has been used!");
        }

        if (userRepository.existsByEmail(registerRequest.email())) {
            throw new EmailAlreadyExistsException("Email has been used!");
        }

        User saved = userRepository.save(User.builder().
                username(registerRequest.username()).
                email(registerRequest.email()).
                passwordHash(passwordEncoder.encode(registerRequest.password())).
                role(Role.ROLE_USER).build());
        userEventService.logEvent(saved, UserEventType.ACCOUNT_CREATED, "");
        return RegisterResponse.from(saved);
    }

    @Transactional
    public LoginResponse readUser(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.username()).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
            CustomUserDetail userDetails = new CustomUserDetail(user.getUsername(), user.getRole(), user.getId(), user.getPremiumPurchasedAt() != null);
            String accessToken = tokenUtil.generateAccessToken(userDetails);
            String refreshToken = refreshTokenService.generateRefreshToken(user);
            userEventService.logEvent(user, UserEventType.LOGIN, "");
            return new LoginResponse(accessToken, refreshToken);
        } else {
            throw new WrongPasswordException("Username and password are wrong!");
        }
    }

    @Transactional
    public SubscriptionResponse purchase(SubscriptionRequest subscriptionRequest) {
        UserDetails userDetails = SecurityUtil.getCurrentUser();
        String username = userDetails.getUsername();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.setPremiumPurchasedAt(LocalDateTime.now());
        userRepository.save(user);
        userEventService.logEvent(user, UserEventType.SUBSCRIPTIONS, "");

        String accessToken = tokenUtil.generateAccessToken(new CustomUserDetail(user.getUsername(), user.getRole(), user.getId(), user.getPremiumPurchasedAt() != null));
        return new SubscriptionResponse("Your subscriptions has been activated", accessToken);
    }

    @Transactional
    public ChangePasswordResponse changePassword(ChangePasswordRequest changePasswordRequest) {
        UserDetails userDetails = SecurityUtil.getCurrentUser();
        String username = userDetails.getUsername();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (passwordEncoder.matches(changePasswordRequest.oldPassword(), user.getPasswordHash())) {
            user.setPasswordHash(passwordEncoder.encode(changePasswordRequest.newPassword()));
            userRepository.save(user);

            List<RefreshToken> refreshTokenList = refreshTokenRepository.findByUserId(user.getId());
            refreshTokenList.stream().forEach(refreshToken -> refreshTokenRepository.delete(refreshToken));

            String accessToken = tokenUtil.generateAccessToken(new CustomUserDetail(user.getUsername(), user.getRole(), user.getId(), user.getPremiumPurchasedAt() != null));
            String refreshToken = refreshTokenService.generateRefreshToken(user);
            userEventService.logEvent(user, UserEventType.CHANGE_PASSWORD, "");
            return new ChangePasswordResponse("Your password changed successfully", accessToken, refreshToken);
        } else {
            throw new WrongPasswordException("Wrong password");
        }
    }

    @Transactional
    public ForgotPasswordResponse forgotPassword(ForgotPasswordRequest forgotPasswordRequest) {
        User user = userRepository.findByEmail(forgotPasswordRequest.email()).orElse(null);
        if (user == null) {
            return new ForgotPasswordResponse("If your email exits, we sent an introduction to it");
        }
        String token = UUID.randomUUID().toString().replace("-", "");
        PasswordResetToken passwordResetToken = PasswordResetToken.builder()
                .token(token)
                .expiredAt(LocalDateTime.now().plusMinutes(15))
                .user(user)
                .build();

        passwordResetTokenRepository.save(passwordResetToken);
        emailService.sendNewPasswordEmail(user.getEmail(), token);
        userEventService.logEvent(user, UserEventType.FORGOT_PASSWORD, "");
        return new ForgotPasswordResponse("If your email exits, we sent an introduction to it");
    }

    @Transactional
    public ResetPasswordResponse resetPassword(ResetPasswordRequest resetPasswordRequest) {
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByToken(resetPasswordRequest.token()).orElseThrow(() -> new PasswordResetTokenNotFound("Password reset token not found"));
        if (passwordResetToken.getExpiredAt().isAfter(LocalDateTime.now()) && passwordResetToken.getUsed() == Boolean.FALSE) {
            User user = passwordResetToken.getUser();
            user.setPasswordHash(passwordEncoder.encode(resetPasswordRequest.newPassword()));
            userRepository.save(user);

            List<RefreshToken> refreshTokenList = refreshTokenRepository.findByUserId(user.getId());
            refreshTokenList.stream().forEach(refreshToken -> refreshTokenRepository.delete(refreshToken));

            passwordResetToken.setUsed(Boolean.TRUE);
            passwordResetTokenRepository.save(passwordResetToken);

            userEventService.logEvent(user, UserEventType.RESET_PASSWORD, "");

            return new ResetPasswordResponse("You change to new password successfully");
        } else {
            throw new PasswordResetTokenExpiredException("Password reset token is expired");
        }


    }

    @Transactional
    public @Nullable DeleteUserResponse deleteUser(DeleteUserRequest deleteUserRequest) {
        UserDetails userDetails = SecurityUtil.getCurrentUser();
        String username = userDetails.getUsername();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (passwordEncoder.matches(deleteUserRequest.password(), user.getPasswordHash())) {
            Long id = user.getId();
            userCaseProgressRepository.deleteByUserId(id);
            List<RefreshToken> refreshTokenList = refreshTokenRepository.findByUserId(id);
            refreshTokenList.forEach(refreshTokenRepository::delete);
            userEventRepository.deleteByUserId(id);
            userRepository.delete(user);
        } else {
            throw new WrongPasswordException("Password is wrong");
        }
        return new DeleteUserResponse("Account deleted successfully");
    }

    public UserProfileResponse getProfile() {
        CustomUserDetail principal = SecurityUtil.getCurrentUser();
        User user = userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        return UserProfileResponse.from(user);
    }

    public List<UserProgressResponse> getProgress() {
        CustomUserDetail principal = SecurityUtil.getCurrentUser();
        List<UserCaseProgress> progressList = userCaseProgressRepository.findByUserId(principal.getUserId());
        return progressList.stream().map(p -> new UserProgressResponse(
                p.getPremiumCase().getId(),
                p.getPremiumCase().getTitle(),
                p.getPremiumCase().getDifficulty(),
                p.getCaseQuestion().getId(),
                p.getCaseQuestion().getOrderIndex(),
                p.getScoreEarned(),
                p.getHintsUsed(),
                p.getAttempts(),
                p.getCompletedAt()
        )).toList();
    }

    public List<LeaderboardEntryResponse> getLeaderboard() {
        List<User> users = userRepository.findAllByOrderByTotalScoreDesc();
        int[] rank = {1};
        return users.stream().map(u -> {
            long casesCompleted = userCaseProgressRepository.countByUserIdAndStatus(u.getId(), "COMPLETED");
            return new LeaderboardEntryResponse(rank[0]++, u.getUsername(), u.getTotalScore(), (int) casesCompleted);
        }).toList();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }
}
