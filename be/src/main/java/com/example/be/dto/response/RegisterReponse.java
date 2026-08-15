package com.example.be.dto.response;

import com.example.be.entity.User;

public record RegisterReponse(String username) {
    public static RegisterReponse from(User user) {
        return new RegisterReponse(user.getUsername());
    }
}
