package com.example.be.util;

import com.example.be.dto.CustomUserDetail;
import com.example.be.enums.Role;
import com.example.be.repository.UserRepository;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class CustomJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private final UserRepository userRepository;

    private final RedisTemplate redisTemplate;

    public CustomJwtAuthenticationConverter(UserRepository userRepository, RedisTemplate redisTemplate) {
        this.userRepository = userRepository;
        this.redisTemplate = redisTemplate;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        String username = jwt.getSubject();
        Long userId = jwt.getClaim("userId");
        String role = jwt.getClaim("role");

        Boolean isPurchased = (Boolean) redisTemplate.opsForValue().get("isPurchased:%s".formatted(userId));
        if (isPurchased == null) {
            isPurchased = userRepository.findById(userId)
                    .map(user -> user.getPremiumPurchasedAt() != null)
                    .orElse(Boolean.FALSE);
            redisTemplate.opsForValue().set("isPurchased:%s".formatted(userId), isPurchased, Duration.ofMinutes(10));
        }

        CustomUserDetail principal = new CustomUserDetail(username, Role.valueOf(role), userId, isPurchased);

        return new UsernamePasswordAuthenticationToken(
                principal,
                jwt,                          // credentials — giữ lại raw Jwt phòng khi cần dùng sau
                principal.getAuthorities()
        );
    }
}