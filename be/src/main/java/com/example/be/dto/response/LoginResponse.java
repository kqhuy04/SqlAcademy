package com.example.be.dto.response;

public record LoginResponse(
        String accessToken,
        String refreshToken
) {

    public static LoginResponse fromMock() {
        return new LoginResponse("123456789", "12345678910");
    }
}
