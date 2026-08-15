package com.example.be.service;

import com.example.be.dto.request.CreateUserRequest;
import com.example.be.dto.response.UserResponse;
import com.example.be.entity.User;
import com.example.be.enums.Role;
import com.example.be.repository.UserRepository;
import org.springframework.stereotype.Service;

import javax.swing.text.html.Option;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse createUser(CreateUserRequest createUserRequest) {

        if (userRepository.existsByEmail(createUserRequest.email())) {
            throw new RuntimeException("Email has been used!");
        }

        if (userRepository.existsByUsername(createUserRequest.username())) {
            throw new RuntimeException("Username has been used!");
        }

        User saved = userRepository.save(User.builder().
                email(createUserRequest.email()).
                username(createUserRequest.username()).
                passwordHash(createUserRequest.passwordHash()).
                role(Role.ROLE_USER).build());
        return UserResponse.from(saved);
    }
}
