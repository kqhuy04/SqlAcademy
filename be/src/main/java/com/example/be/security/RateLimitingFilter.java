package com.example.be.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Collections;
import java.util.List;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {
    private final RedisTemplate<String, Object> redisTemplate;
    private final RedisScript<Long> slidingWindowScript;

    private static final String SLIDING_WINDOW_LUA = """
            local key = KEYS[1]
            local now = tonumber(ARGV[1])
            local window = tonumber(ARGV[2])
            local limit = tonumber(ARGV[3])
            local ttl = tonumber(ARGV[4])
            local clearBefore = now - window

            redis.call('ZREMRANGEBYSCORE', key, 0, clearBefore)
            local currentRequests = redis.call('ZCARD', key)

            if currentRequests < limit then
                redis.call('ZADD', key, now, now)
                redis.call('EXPIRE', key, ttl)
                return 1
            else
                return 0
            end
            """;

    public RateLimitingFilter(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
        this.slidingWindowScript = new DefaultRedisScript<>(SLIDING_WINDOW_LUA, Long.class);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        // 1. Bypass các endpoint không cần rate limit & preflight CORS OPTIONS
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())
                || path.startsWith("/swagger-ui")
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

        // 3. Chuẩn hóa path để tránh làm tràn RAM Redis bằng dynamic slugs/IDs
        String normalizedPath = normalizePath(path);
        String redisKey = "rate:" + clientIp + ":" + normalizedPath;

        long now = System.currentTimeMillis();
        long windowMillis = window.toMillis();
        long ttlSeconds = window.toSeconds() + 1;

        List<String> keys = Collections.singletonList(redisKey);
        Long allowed = redisTemplate.execute(
                slidingWindowScript,
                keys,
                String.valueOf(now),
                String.valueOf(windowMillis),
                String.valueOf(maxRequests),
                String.valueOf(ttlSeconds)
        );

        if (allowed == null || allowed == 0L) {
            sendRateLimitResponse(response);
            return; // Rất quan trọng: Dừng filter chain tại đây!
        }

        // 4. Cho phép request đi tiếp vào Controller
        filterChain.doFilter(request, response);
    }

    private String normalizePath(String path) {
        if (path.startsWith("/api/v1/posts/")) {
            return "/api/v1/posts/*";
        }
        if (path.startsWith("/api/v1/premium_cases/")) {
            if (path.startsWith("/api/v1/premium_cases/run")) {
                return "/api/v1/premium_cases/run";
            }
            return "/api/v1/premium_cases/*";
        }
        return path;
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
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader != null && !xfHeader.isBlank() && !"unknown".equalsIgnoreCase(xfHeader)) {
            return xfHeader.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}