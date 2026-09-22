package com.example.be.service;

import com.example.be.dto.CustomUserDetail;
import com.example.be.dto.LeaderboardProjection;
import com.example.be.dto.request.*;
import com.example.be.dto.response.*;
import com.example.be.entity.*;
import com.example.be.enums.AuthProvider;
import com.example.be.enums.Role;
import com.example.be.enums.UserEventType;
import com.example.be.exception.*;
import com.example.be.repository.*;
import com.example.be.util.PasswordGenerator;
import com.example.be.util.SecurityUtil;
import com.example.be.util.TokenUtil;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import org.jspecify.annotations.Nullable;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
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
    private final GoogleAuthService googleAuthService;

    private final RedisTemplate<String, Object> redisTemplate;

    UserService(UserRepository userRepository,
                TokenUtil tokenUtil,
                PasswordEncoder passwordEncoder,
                RefreshTokenRepository refreshTokenRepository,
                RefreshTokenService refreshTokenService,
                EmailService emailService,
                UserEventService userEventService,
                UserEventRepository userEventRepository,
                UserCaseProgressRepository userCaseProgressRepository,
                PasswordResetTokenRepository passwordResetTokenRepository,
                GoogleAuthService googleAuthService,
                RedisTemplate<String, Object> redisTemplate) {

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
        this.googleAuthService = googleAuthService;
        this.redisTemplate = redisTemplate;
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
        User user = userRepository.findByUsername(loginRequest.username())
                .orElseThrow(() -> new WrongPasswordException("Invalid username or password"));
        if (!passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
            throw new WrongPasswordException("Invalid username or password");
        }

        CustomUserDetail userDetails = new CustomUserDetail(user.getUsername(), user.getRole(), user.getId(), user.getPremiumPurchasedAt() != null);
        String accessToken = tokenUtil.generateAccessToken(userDetails);
        String refreshToken = refreshTokenService.generateRefreshToken(user);
        userEventService.logEvent(user, UserEventType.LOGIN, "");
        return new LoginResponse(accessToken, refreshToken);
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

        redisTemplate.opsForValue().set("pwd_reset:%s".formatted(token), forgotPasswordRequest.email(), Duration.ofMinutes(15));
        emailService.sendNewPasswordEmail(user.getEmail(), token);
        userEventService.logEvent(user, UserEventType.FORGOT_PASSWORD, "");
        return new ForgotPasswordResponse("If your email exits, we sent an introduction to it");
    }

    @Transactional
    public ResetPasswordResponse resetPassword(ResetPasswordRequest resetPasswordRequest) {
        Object o = redisTemplate.opsForValue().getAndDelete("pwd_reset:%s".formatted(resetPasswordRequest.token()));
        if (o == null) {
            throw new PasswordResetTokenExpiredException("Password reset token is expired or your email was wrong");
        }
        if (o instanceof String email) {

            User user = userRepository.findByEmail(email).orElseThrow(() -> new UserNotFoundException("Email not found"));
            user.setPasswordHash(passwordEncoder.encode(resetPasswordRequest.newPassword()));
            userRepository.save(user);

            List<RefreshToken> refreshTokenList = refreshTokenRepository.findByUserId(user.getId());
            refreshTokenList.stream().forEach(refreshToken -> refreshTokenRepository.delete(refreshToken));
            userEventService.logEvent(user, UserEventType.RESET_PASSWORD, "");

            return new ResetPasswordResponse("You change to new password successfully");
        } else {
            throw new RuntimeException("Object is not a instance of String");
        }
    }

    @Transactional
    public @Nullable DeleteUserResponse deleteUser(DeleteUserRequest deleteUserRequest) {
        UserDetails userDetails = SecurityUtil.getCurrentUser();
        String username = userDetails.getUsername();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (!passwordEncoder.matches(deleteUserRequest.password(), user.getPasswordHash())) {
            throw new WrongPasswordException("Password is wrong");
        }
        Long id = user.getId();
        userCaseProgressRepository.deleteByUserId(id);
        List<RefreshToken> refreshTokenList = refreshTokenRepository.findByUserId(id);
        refreshTokenList.forEach(refreshTokenRepository::delete);
        userEventRepository.deleteByUserId(id);
        userRepository.delete(user);
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
        List<UserCaseProgress> progressList = userCaseProgressRepository.findByUserIdWithCaseAndQuestion(principal.getUserId());
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

    @Cacheable(cacheNames = "leaderboard", key = "'top50'", sync = true)
    public List<LeaderboardEntryResponse> getLeaderboard() {
        //System.out.println(">>> [DEBUG] ĐANG TRUY VẤN DATABASE MYSQL ĐỂ TÍNH ĐIỂM...");
        List<LeaderboardProjection> topUsers = userRepository.getTopLeaderboard(50);
        int[] rank = {1};
        return topUsers.stream()
                .map(u -> new LeaderboardEntryResponse(
                        rank[0]++,
                        u.getUsername(),
                        u.getTotalScore(),
                        u.getCasesCompleted().intValue()
                ))
                .toList();
    }

    @Transactional
    public ChangeUsernameResponse changeUsername(ChangeUsernameRequest changeUsernameRequest) {
        if (userRepository.existsByUsername(changeUsernameRequest.username())) {
            throw new UsernameAlreadyExistsException("Username already exists");
        }
        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        User user = userRepository.findById(customUserDetail.getUserId()).orElseThrow(() -> new UserNotFoundException("User not found"));

        user.setUsername(changeUsernameRequest.username());
        userRepository.save(user);
        return new ChangeUsernameResponse("Change username successfully");
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }

    @Transactional
    public LoginResponse loginWithGoogle(GoogleLoginRequest googleLoginRequest) {
        GoogleIdToken.Payload payload = googleAuthService.verifyToken(googleLoginRequest.idToken());

        String googleSubId = payload.getSubject();
        String email = payload.getEmail();
        String name = (String) payload.get("name");
        String pictureUrl = (String) payload.get("picture");

        User user = userRepository.findByEmail(email).map(existingUser -> {
            if (existingUser.getProviderId() == null) {
                existingUser.setAuthProvider(AuthProvider.GOOGLE);
                existingUser.setProviderId(googleSubId);
                if (existingUser.getAvatarUrl() == null) {
                    existingUser.setAvatarUrl(pictureUrl);
                }
                return userRepository.save(existingUser);
            }
            return existingUser;
        }).orElseGet(() -> {
            String uniqueUsername = generateUniqueUsername(email);
            User newUser = User.builder()
                    .email(email)
                    .username(uniqueUsername)
                    .passwordHash(null)
                    .authProvider(AuthProvider.GOOGLE)
                    .providerId(googleSubId)
                    .avatarUrl(pictureUrl)
                    .role(Role.ROLE_USER)
                    .totalScore(0)
                    .build();
            User savedUser = userRepository.save(newUser);
            userEventService.logEvent(savedUser, UserEventType.ACCOUNT_CREATED, "Registered via Google OAuth");
            return savedUser;
        });
        CustomUserDetail userDetails = new CustomUserDetail(
                user.getUsername(),
                user.getRole(),
                user.getId(),
                user.getPremiumPurchasedAt() != null
        );
        String accessToken = tokenUtil.generateAccessToken(userDetails);
        String refreshToken = refreshTokenService.generateRefreshToken(user);
        userEventService.logEvent(user, UserEventType.LOGIN, "Logged in via Google OAuth");
        return new LoginResponse(accessToken, refreshToken);
    }
    private String generateUniqueUsername(String email) {
        String baseName = email.split("@")[0].replaceAll("[^a-zA-Z0-9]", "");
        if (baseName.length() > 15) {
            baseName = baseName.substring(0, 15);
        }
        if (baseName.isEmpty()) {
            baseName = "cadet"; // Tên mặc định cho học viên SQL Police
        }
        String candidate = baseName;
        while (userRepository.existsByUsername(candidate)) {
            candidate = baseName + "_" + UUID.randomUUID().toString().substring(0, 5);
        }
        return candidate;
    }

}
