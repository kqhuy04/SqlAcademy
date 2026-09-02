package com.example.be.dto.request;

import jakarta.validation.constraints.NotBlank;

public record LogoutRequest(
        @NotBlank(message = "refresh token can't be null")
        String refreshToken
) {
}
