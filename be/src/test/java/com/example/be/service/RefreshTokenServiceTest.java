package com.example.be.service;

import com.example.be.exception.RefreshTokenNotFoundException;
import com.example.be.service.RefreshTokenService;

import com.example.be.dto.request.LogoutRequest;
import com.example.be.dto.response.LogoutResponse;
import com.example.be.entity.RefreshToken;
import com.example.be.repository.RefreshTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {
    @InjectMocks
    RefreshTokenService refreshTokenService;

    @Mock
    RefreshTokenRepository refreshTokenRepository;

    @BeforeEach
    void setUp() {
    }

    @Test
    void getRefreshToken() {
    }

    @Test
    void shouldDeleteToken_whenTokenExist_inLogout() {
        RefreshToken refreshToken = RefreshToken.builder()
                .token("123")
                .build();
        LogoutRequest logoutRequest = new LogoutRequest("123");
        when(refreshTokenRepository.findByToken("123")).thenReturn(Optional.of(refreshToken));

        LogoutResponse logoutResponse = refreshTokenService.logout(logoutRequest);

        verify(refreshTokenRepository, times(1)).delete(refreshToken);
        assertEquals("You log out successfully", logoutResponse.message());

    }

    @Test
    void shoulThrowException_whenTokenIsInvalid_inLogout() {
        LogoutRequest logoutRequest = new LogoutRequest("");
        when(refreshTokenRepository.findByToken("")).thenReturn(Optional.empty());

        assertThrows(RefreshTokenNotFoundException.class, () ->refreshTokenService.logout(logoutRequest));
    }
}