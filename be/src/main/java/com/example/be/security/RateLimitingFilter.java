package com.example.be.security;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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

    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> forgotPasswordBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> queryBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> defaultBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getRequestURI();

        if (path.startsWith("/api/v1/payments/webhook")
                || path.startsWith("/swagger-ui")
                || path.startsWith("/v3/api-docs")
                || path.startsWith("/actuator/health")) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = getClientIp(request);
        Bucket targetBucket;

        if (path.equals("/api/v1/auth/login") || path.equals("/api/v1/auth/register")) {
            targetBucket = loginBuckets.computeIfAbsent(clientIp, k -> createBucket(5, Duration.ofMinutes(1)));
        } else if (path.equals("/api/v1/auth/forgot-password")) {
            targetBucket = forgotPasswordBuckets.computeIfAbsent(clientIp, k -> createBucket(3, Duration.ofMinutes(5)));
        } else if (path.startsWith("/api/v1/cases/run")) {
            targetBucket = queryBuckets.computeIfAbsent(clientIp, k -> createBucket(20, Duration.ofMinutes(1)));
        } else {
            targetBucket = defaultBuckets.computeIfAbsent(clientIp, k -> createBucket(60, Duration.ofMinutes(1)));
        }

        // 3. TIÊU THỤ TOKEN
        if (targetBucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
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
    }

    private Bucket createBucket(int capacity, Duration duration) {
        Refill refill = Refill.greedy(capacity, duration);
        Bandwidth limit = Bandwidth.classic(capacity, refill);
        return Bucket.builder().addLimit(limit).build();
    }

    private String getClientIp(HttpServletRequest request) {
        // [FIX PT-04] Do NOT trust X-Forwarded-For from untrusted clients.
        // X-Forwarded-For can be spoofed by anyone to bypass rate limiting.
        // Use actual socket address for rate limiting. If a trusted reverse proxy
        // is added in front of this service in production, configure Spring's
        // ForwardedHeaderFilter with an explicit trusted proxy allowlist instead.
        return request.getRemoteAddr();
    }

    @Scheduled(fixedRate = 600000) // 10 phút dọn một lần nếu Map quá lớn
    public void purgeOldBuckets() {
        if (defaultBuckets.size() > 5000) defaultBuckets.clear();
        if (loginBuckets.size() > 5000) loginBuckets.clear();
        if (queryBuckets.size() > 5000) queryBuckets.clear();
    }
}