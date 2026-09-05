package com.example.be.util;

import com.example.be.config.JwtConfig;
import com.example.be.dto.CustomUserDetail;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;

@Component
public class TokenUtil {

    private final JwtConfig jwtConfig;

    public TokenUtil(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }

    public String generateAccessToken(CustomUserDetail userDetails) {
        return Jwts.builder().
                subject(userDetails.getUsername())
                .claim("role", userDetails.getRole().name())
                .claim("userId", userDetails.getUserId())
                .claim("isPurchased", userDetails.getIsPurchased())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getExpiration() * 1000))
                .signWith(jwtConfig.jwtSigningKey(), Jwts.SIG.HS256)
                .compact();
    }

    public String generateRefreshToken() {
        SecureRandom secureRandom = new SecureRandom();
        byte[] randomBytes = new byte[64];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
