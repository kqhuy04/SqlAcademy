package com.example.be.service;

import com.example.be.dto.request.*;
import com.example.be.dto.response.*;
import com.example.be.entity.User;
import com.example.be.enums.Role;
import com.example.be.exception.UsernameAlreadyExistsException;
import com.example.be.jwt.JwtUtil;
import com.example.be.repository.UserRepository;
import com.example.be.security.JwtAuthFilter;
import io.jsonwebtoken.Jwt;
import org.jspecify.annotations.Nullable;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    UserService(UserRepository userRepository, JwtUtil jwtUtil) {

        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public RegisterReponse createUser(RegisterRequest registerRequest){
        if (userRepository.existsByUsername(registerRequest.username())) {
            throw new UsernameAlreadyExistsException("Username has been used!");
        }

        User saved = userRepository.save(User.builder().
                username(registerRequest.username()).
                passwordHash(registerRequest.password()).
                role(Role.ROLE_USER).build());
        return RegisterReponse.from(saved);
    }

    public LoginResponse readUser(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.username()).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        if (user.getPasswordHash().equals(loginRequest.password())) {
            String token = jwtUtil.generateToken(user);
            return new LoginResponse(token);
        } else {
            throw new RuntimeException("Username and password are wrong!");
        }
    }

    public SubscriptionResponse purchase(SubscriptionRequest subscriptionRequest) {
        return new SubscriptionResponse();
    }

    public ChangePasswordResponse changePassword(ChangePasswordRequest changePasswordRequest) {
        return new ChangePasswordResponse();
    }

    public ResetPasswordResponse forgetPassword(ResetPasswordRequest resetPasswordRequest) {
        return new ResetPasswordResponse();
    }

    public @Nullable DeleteUserReponse deleteUser() {
        return new DeleteUserReponse();
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username).orElseThrow();
        return user;
    }
}
