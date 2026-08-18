package com.example.be.dto.response;

public record ChangePasswordResponse(
        String message,
        String accessToken,
        String refreshToken
) {
}
