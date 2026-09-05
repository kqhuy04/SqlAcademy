package com.example.be.util;

import com.example.be.dto.CustomUserDetail;
import com.example.be.enums.Role;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

@Component
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String username = jwt.getSubject();
        Long userId = jwt.getClaim("userId");
        String role = jwt.getClaim("role");
        Boolean isPuchased = jwt.getClaim("isPuchased");

        CustomUserDetail principal = new CustomUserDetail(username, Role.valueOf(role), userId, isPuchased);

        return new UsernamePasswordAuthenticationToken(
                principal,
                jwt,                          // credentials — giữ lại raw Jwt phòng khi cần dùng sau
                principal.getAuthorities()
        );
    }
}