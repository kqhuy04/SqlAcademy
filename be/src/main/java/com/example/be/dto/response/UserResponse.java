package com.example.be.dto.response;

import com.example.be.entity.User;

public record UserResponse(String username) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getUsername());
    }
}
