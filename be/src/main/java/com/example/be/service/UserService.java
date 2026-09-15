package com.example.be.service;

import com.example.be.dto.CustomUserDetail;
import com.example.be.dto.request.*;
import com.example.be.dto.response.*;
import com.example.be.entity.RefreshToken;
import com.example.be.entity.User;
import com.example.be.entity.UserCaseProgress;
import com.example.be.entity.UserEvent;
import com.example.be.enums.Role;
import com.example.be.enums.UserEventType;
import com.example.be.exception.*;
import com.example.be.repository.RefreshTokenRepository;
import com.example.be.repository.UserCaseProgressRepository;
import com.example.be.repository.UserEventRepository;
import com.example.be.repository.UserRepository;
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

    UserService(UserRepository userRepository,
                TokenUtil tokenUtil,
                PasswordEncoder passwordEncoder,
                RefreshTokenRepository refreshTokenRepository,
                RefreshTokenService refreshTokenService,
                EmailService emailService,
                UserEventService userEventService,
                UserEventRepository userEventRepository,
                UserCaseProgressRepository userCaseProgressRepository) {

        this.userRepository = userRepository;
        this.tokenUtil = tokenUtil;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
        this.userEventService = userEventService;
        this.userEventRepository = userEventRepository;
        this.userCaseProgressRepository = userCaseProgressRepository;
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
        return new SubscriptionResponse("Your subscriptions has been activated");
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
    public ResetPasswordResponse resetPassword(ResetPasswordRequest resetPasswordRequest) {
        User user = userRepository.findByEmail(resetPasswordRequest.email()).orElseThrow(() -> new UserNotFoundException("Email not found"));
        String newPassword = PasswordGenerator.generateRandomPassword(12);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        Long id = user.getId();
        List<RefreshToken> refreshTokenList = refreshTokenRepository.findByUserId(id);
        refreshTokenList.stream()
                .forEach(refreshToken -> refreshTokenRepository.delete(refreshToken));
        emailService.sendNewPasswordEmail(user.getEmail(), newPassword);
        userEventService.logEvent(user, UserEventType.RESET_PASSWORD, "");
        return new ResetPasswordResponse("An email with new password was send to your email");
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
            List<UserEvent> userEventList = userEventRepository.findByUserId(id);
            userEventList.forEach(userEventRepository::delete);
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
            long casesCompleted = userCaseProgressRepository.countByUserId(u.getId());
            return new LeaderboardEntryResponse(rank[0]++, u.getUsername(), u.getTotalScore(), u.getTotalXp(), (int) casesCompleted);
        }).toList();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }
}
