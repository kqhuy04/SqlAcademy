package com.example.be.token;

import com.example.be.config.JwtConfig;
import com.example.be.dto.CustomUserDetails;
import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import java.util.Date;

@Component
public class JwtUtil {

    private final JwtConfig jwtConfig;

    public JwtUtil(JwtConfig jwtConfig) {
        this.jwtConfig = jwtConfig;
    }
    public String generateToken(CustomUserDetails userDetails) {
        return Jwts.builder().
                subject(userDetails.getUsername())
                .claim("role", userDetails.getRole().name())
                .claim("userId", userDetails.getUserId())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + jwtConfig.getExpiration()))
                .signWith(jwtConfig.jwtSigningKey(), Jwts.SIG.HS256)
                .compact();
    }
}
