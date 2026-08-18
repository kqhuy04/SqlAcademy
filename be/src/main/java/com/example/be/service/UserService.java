package com.example.be.service;

import com.example.be.dto.request.*;
import com.example.be.dto.response.*;
import com.example.be.dto.CustomUserDetails;
import com.example.be.entity.User;
import com.example.be.enums.Role;
import com.example.be.exception.UnauthenticatedException;
import com.example.be.exception.UsernameAlreadyExistsException;
import com.example.be.exception.WrongPasswordException;
import com.example.be.token.JwtUtil;
import com.example.be.repository.UserRepository;
import org.jspecify.annotations.Nullable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    UserService(UserRepository userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public RegisterReponse createUser(RegisterRequest registerRequest){
        if (userRepository.existsByUsername(registerRequest.username())) {
            throw new UsernameAlreadyExistsException("Username has been used!");
        }

        User saved = userRepository.save(User.builder().
                username(registerRequest.username()).
                passwordHash(passwordEncoder.encode(registerRequest.password())).
                role(Role.ROLE_USER).build());
        return RegisterReponse.from(saved);
    }

    public LoginResponse readUser(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.username()).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (passwordEncoder.matches(loginRequest.password(), user.getPasswordHash())) {
            CustomUserDetails userDetails = new CustomUserDetails(user.getUsername(), user.getRole(), user.getId());
            String token = jwtUtil.generateToken(userDetails);
            return new LoginResponse(token);
        } else {
            throw new RuntimeException("Username and password are wrong!");
        }
    }

    public SubscriptionResponse purchase(SubscriptionRequest subscriptionRequest) {
        return new SubscriptionResponse();
    }

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
            } else {
                throw new WrongPasswordException("Wrong password");
            }
        } else {
            throw new UnauthenticatedException("User is not authenticated");
        }
        return new ChangePasswordResponse("Your password changed successfully");
    }

    public ResetPasswordResponse forgetPassword(ResetPasswordRequest resetPasswordRequest) {
        return new ResetPasswordResponse();
    }

    public @Nullable DeleteUserReponse deleteUser() {
        return new DeleteUserReponse();
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return null;
    }
}
