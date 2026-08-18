package com.example.be.dto.response;

public record RefreshTokenResponse(
        String message,
        String accessToken
) {
}
