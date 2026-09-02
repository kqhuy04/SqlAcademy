package com.example.be.service;

import com.example.be.dto.request.*;
import com.example.be.dto.response.*;
import com.example.be.dto.CustomUserDetails;
import com.example.be.entity.RefreshToken;
import com.example.be.entity.User;
import com.example.be.enums.Role;
import com.example.be.exception.*;
import com.example.be.repository.RefreshTokenRepository;
import com.example.be.util.PasswordGenerator;
import com.example.be.util.TokenUtil;
import com.example.be.repository.UserRepository;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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


    UserService(UserRepository userRepository, TokenUtil tokenUtil, PasswordEncoder passwordEncoder, RefreshTokenRepository refreshTokenRepository, RefreshTokenService refreshTokenService, EmailService emailService) {

        this.userRepository = userRepository;
        this.tokenUtil = tokenUtil;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
        this.refreshTokenService = refreshTokenService;
        this.emailService = emailService;
    }

    public RegisterResponse createUser(RegisterRequest registerRequest){
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
        return RegisterResponse.from(saved);
    }

    public LoginResponse readUser(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.username()).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
            CustomUserDetails userDetails = new CustomUserDetails(user.getUsername(), user.getRole(), user.getId());
            String accessToken = tokenUtil.generateAccessToken(userDetails);
            String refreshToken = refreshTokenService.generateRefreshToken(user);
            return new LoginResponse(accessToken, refreshToken);
        } else {
            throw new WrongPasswordException("Username and password are wrong!");
        }
    }

    public SubscriptionResponse purchase(SubscriptionRequest subscriptionRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthenticatedException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
            user.setPremiumPurchasedAt(LocalDateTime.now());
            userRepository.save(user);
        }

        return new SubscriptionResponse("Your subscriptions has been activated");
    }

    @Transactional
    public ChangePasswordResponse changePassword(ChangePasswordRequest changePasswordRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthenticatedException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            String username = userDetails.getUsername();
            User user = userRepository.findByUsername(username).orElseThrow(() -> new UsernameNotFoundException("User not found"));
            if (passwordEncoder.matches(changePasswordRequest.oldPassword(), user.getPasswordHash())) {
                user.setPasswordHash(passwordEncoder.encode(changePasswordRequest.newPassword()));
                userRepository.save(user);

                List<RefreshToken> refreshTokenList = refreshTokenRepository.findByUserId(user.getId());
                refreshTokenList.stream().forEach(refreshToken -> refreshTokenRepository.delete(refreshToken));

                String accessToken = tokenUtil.generateAccessToken(new CustomUserDetails(user.getUsername(), user.getRole(), user.getId()));
                String refreshToken = refreshTokenService.generateRefreshToken(user);
                return new ChangePasswordResponse("Your password changed successfully", accessToken, refreshToken);
            } else {
                throw new WrongPasswordException("Wrong password");
            }
        } else {
            throw new UnauthenticatedException("User is not authenticated");
        }

    }

    public ResetPasswordResponse resetPassword(ResetPasswordRequest resetPasswordRequest) {
        User user = userRepository.findByEmail(resetPasswordRequest.email()).orElseThrow(() -> new UserNotFoundException("Email not found"));
        String newPassword = PasswordGenerator.generateRandomPassword(12);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        emailService.sendNewPasswordEmail(user.getEmail(), newPassword);
        return new ResetPasswordResponse("An email with new password was send to your email");
    }

    public @Nullable DeleteUserResponse deleteUser() {
        return new DeleteUserResponse();
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }
}
