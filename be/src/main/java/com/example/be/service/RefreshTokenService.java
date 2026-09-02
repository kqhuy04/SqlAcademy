package com.example.be.service;

import com.example.be.dto.CustomUserDetails;
import com.example.be.dto.request.LogoutRequest;
import com.example.be.dto.request.RefreshTokenRequest;
import com.example.be.dto.response.LogoutResponse;
import com.example.be.dto.response.RefreshTokenResponse;
import com.example.be.entity.RefreshToken;
import com.example.be.entity.User;
import com.example.be.exception.RefreshTokenExpiredException;
import com.example.be.exception.RefreshTokenInvalidException;
import com.example.be.exception.RefreshTokenNotFoundException;
import com.example.be.exception.UserNotFoundException;
import com.example.be.repository.RefreshTokenRepository;
import com.example.be.util.TokenUtil;
import org.jspecify.annotations.Nullable;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final TokenUtil tokenUtil;

    @Value("${rt.expiration}")
    private Long refreshTokenExpiration;

    RefreshTokenService(RefreshTokenRepository refreshTokenRepository, TokenUtil tokenUtil) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.tokenUtil = tokenUtil;
    }

    public RefreshTokenResponse getRefreshToken(RefreshTokenRequest refreshTokenRequest) {
        String userToken = refreshTokenRequest.refreshToken();
        RefreshToken dbToken = refreshTokenRepository.findByToken(userToken).orElseThrow(() -> new RefreshTokenNotFoundException("Refresh token not found"));
        if (Boolean.TRUE.equals(dbToken.getRevoked())) {
            throw new RefreshTokenInvalidException("Refresh token has been revoked");
        }
        if (dbToken.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new RefreshTokenExpiredException("Refresh token has expired");
        }
        User user = dbToken.getUser();
        if (user == null) {
            throw new UserNotFoundException("User not found");
        }
        String accessToken = tokenUtil.generateAccessToken(new CustomUserDetails(user.getUsername(), user.getRole(), user.getId()));
        return new RefreshTokenResponse("User get back Access Token successfully", accessToken);
    }

    public @Nullable LogoutResponse logout(LogoutRequest logoutRequest) {
        RefreshToken token = refreshTokenRepository.findByToken(logoutRequest.refreshToken()).orElseThrow(() -> new RefreshTokenNotFoundException("Refresh token not found"));
        refreshTokenRepository.delete(token);
        return new LogoutResponse("You log out successfully");
    }

    public String generateRefreshToken(User user) {
        String refreshToken = tokenUtil.generateRefreshToken();
        RefreshToken saved = refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(refreshToken)
                .revoked(false)
                .expiredAt(LocalDateTime.now().plus(refreshTokenExpiration, ChronoUnit.SECONDS)).build());
        return refreshToken;
    }
}
