package com.example.be.dto.response;

import com.example.be.entity.RefreshToken;

public record LoginResponse(
        String token
) {
    public static LoginResponse from(RefreshToken refreshToken) {
        return new LoginResponse(refreshToken.getTokenHash());
    }

    public static LoginResponse fromMock() {
        return new LoginResponse("123456789");
    }
}
