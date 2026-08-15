package com.example.be.service;

import com.example.be.dto.request.*;
import com.example.be.dto.response.*;
import com.example.be.entity.User;
import com.example.be.enums.Role;
import com.example.be.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;

    UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public RegisterReponse createUser(RegisterRequest registerRequest) {
        if (userRepository.existsByUsername(registerRequest.username())) {
            throw new RuntimeException("Username has been used!");
        }

        User saved = userRepository.save(User.builder().
                username(registerRequest.username()).
                passwordHash(registerRequest.password()).
                role(Role.ROLE_USER).build());
        return RegisterReponse.from(saved);
    }

    public LoginResponse readUser(LoginRequest loginRequest) {
        User user = userRepository.findByUsername(loginRequest.username()).orElseThrow();
        if (user.getPasswordHash().equals(loginRequest.password())) {
            return LoginResponse.fromMock();
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

    public ForgetPasswordResponse forgetPassword(ForgetPasswordRequest forgetPasswordRequest) {
        return new ForgetPasswordResponse();
    }

}
