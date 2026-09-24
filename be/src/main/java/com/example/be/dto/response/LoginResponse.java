package com.example.be.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record LoginResponse(
        String accessToken,
        String refreshToken,
        UserProfileResponse user
) {
    public LoginResponse(String accessToken, String refreshToken) {
        this(accessToken, refreshToken, null);
    }

    public static LoginResponse fromMock() {
        return new LoginResponse("123456789", "12345678910", null);
    }
}
