package com.example.be.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    private final RedisTemplate<String, Object> redisTemplate;

    public RateLimitingFilter(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // 1. Bypass các endpoint không cần rate limit
        if (path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/api/v1/payments/webhook")
                || path.startsWith("/actuator/health")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        int maxRequests;
        Duration window;

        // 2. Xác định hạn mức theo từng endpoint
        if (path.equals("/api/v1/auth/login") || path.equals("/api/v1/auth/register")) {
            maxRequests = 5;
            window = Duration.ofMinutes(1);
        } else if (path.equals("/api/v1/auth/forgot-password")) {
            maxRequests = 3;
            window = Duration.ofMinutes(5);
        } else if (path.startsWith("/api/v1/premium_cases/run")) {
            maxRequests = 20;
            window = Duration.ofMinutes(1);
        } else {
            maxRequests = 60;
            window = Duration.ofMinutes(1);
        }

        // 3. Kiểm tra hạn mức trên Redis
        String redisKey = "rate:" + clientIp + ":" + path;
        Long currentCount = redisTemplate.opsForValue().increment(redisKey);

        if (currentCount != null && currentCount == 1) {
            redisTemplate.expire(redisKey, window);
        }

        if (currentCount != null && currentCount > maxRequests) {
            sendRateLimitResponse(response);
            return; // Rất quan trọng: Dừng filter chain tại đây!
        }

        // 4. Cho phép request đi tiếp vào Controller
        filterChain.doFilter(request, response);
    }

    private void sendRateLimitResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("""
        {
            "status": 429,
            "message": "Too many requests. Please slow down and try again later!",
            "timestamp": "%s"
        }
        """.formatted(java.time.LocalDateTime.now()));
    }

    private String getClientIp(HttpServletRequest request) {
        return request.getRemoteAddr();
    }
}