package com.example.be.service;

import com.example.be.dto.CustomUserDetails;
import com.example.be.dto.request.RefreshTokenRequest;
import com.example.be.dto.response.RefreshTokenResponse;
import com.example.be.entity.RefreshToken;
import com.example.be.entity.User;
import com.example.be.exception.RefreshTokenNotFoundException;
import com.example.be.exception.UserNotFoundException;
import com.example.be.repository.RefreshTokenRepository;
import com.example.be.token.JwtUtil;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    RefreshTokenService(RefreshTokenRepository refreshTokenRepository, JwtUtil jwtUtil) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtUtil = jwtUtil;
    }

    public String generateRefreshToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    public RefreshTokenResponse getRefreshToken(RefreshTokenRequest refreshTokenRequest) {
        String userToken = refreshTokenRequest.refreshToken();
        RefreshToken dbToken = refreshTokenRepository.findByToken(userToken).orElseThrow(() -> new RefreshTokenNotFoundException("Refresh token not found"));
        User user = dbToken.getUser();
        if (user == null) {
            throw new UserNotFoundException("User not found");
        }
        String accessToken = jwtUtil.generateToken(new CustomUserDetails(user.getUsername(), user.getRole(), user.getId()));
        return new RefreshTokenResponse("User get back Access Token successfully",accessToken);
    }
}
