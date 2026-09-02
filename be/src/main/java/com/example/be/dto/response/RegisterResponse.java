package com.example.be.dto.response;

import com.example.be.entity.User;

public record RegisterResponse(String username) {
    public static RegisterResponse from(User user) {
        return new RegisterResponse(user.getUsername());
    }
}
