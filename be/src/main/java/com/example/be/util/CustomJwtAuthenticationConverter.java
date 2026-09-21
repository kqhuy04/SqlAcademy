package com.example.be.util;

import com.example.be.dto.CustomUserDetail;
import com.example.be.enums.Role;
import com.example.be.repository.UserRepository;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    public CustomJwtAuthenticationConverter(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String username = jwt.getSubject();
        Long userId = jwt.getClaim("userId");
        String role = jwt.getClaim("role");

        // [FIX PT-02] Do NOT trust isPurchased from JWT claim — it can be forged.
        // Always verify premium status from the database (source of truth).
        boolean isPurchasedFromDb = userRepository.findById(userId)
                .map(user -> user.getPremiumPurchasedAt() != null)
                .orElse(false);

        CustomUserDetail principal = new CustomUserDetail(username, Role.valueOf(role), userId, isPurchasedFromDb);

        return new UsernamePasswordAuthenticationToken(
                principal,
                jwt,                          // credentials — giữ lại raw Jwt phòng khi cần dùng sau
                principal.getAuthorities()
        );
    }
}