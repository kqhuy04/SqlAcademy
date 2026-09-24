package com.example.be.config;

import com.example.be.security.JwtBlocklistFilter;
import com.example.be.security.RateLimitingFilter;
import com.example.be.util.CustomJwtAuthenticationConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
@EnableWebSecurity
public class SecurityConfig {

    private final CustomJwtAuthenticationConverter customJwtAuthenticationConverter;
    private final JwtDecoder jwtDecoder;
    private final RateLimitingFilter rateLimitingFilter;
    private final JwtBlocklistFilter jwtBlocklistFilter;
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(CustomJwtAuthenticationConverter customJwtAuthenticationConverter,
                          JwtDecoder jwtDecoder,
                          RateLimitingFilter rateLimitingFilter,
                          JwtBlocklistFilter jwtBlocklistFilter) {
        this.customJwtAuthenticationConverter = customJwtAuthenticationConverter;
        this.jwtDecoder = jwtDecoder;
        this.rateLimitingFilter = rateLimitingFilter;
        this.jwtBlocklistFilter = jwtBlocklistFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(rateLimitingFilter, BearerTokenAuthenticationFilter.class)
                // [FIX PT-05] Check blocklist before Spring Security processes the JWT
                .addFilterBefore(jwtBlocklistFilter, BearerTokenAuthenticationFilter.class)
                .authorizeHttpRequests(
                        auth -> auth
                                .requestMatchers("/api/v1/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html", "/api/v1/payments/webhook/**", "/actuator/health/**").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/premium_cases").permitAll()
                                .requestMatchers(HttpMethod.GET, "/api/v1/users/leaderboard").permitAll()
                                .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(jwt -> jwt
                        .decoder(jwtDecoder)
                        .jwtAuthenticationConverter(customJwtAuthenticationConverter)));
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Chỉ cho phép đúng origin này gọi — không dùng "*" vì
        // khi allowCredentials = true, Spring Security sẽ throw exception nếu dùng "*"
        config.setAllowedOrigins(List.of(allowedOrigins));

        // Các HTTP method FE được phép dùng
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Header FE được phép gửi:
        // - "Authorization" → để đính kèm JWT Bearer token
        // - "Content-Type"  → để gửi JSON body
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin"));

        // Cho phép FE đọc header response như "Authorization" nếu cần
        config.setExposedHeaders(List.of("Authorization"));

        // true → browser được phép gửi cookie hoặc Authorization header
        // Bắt buộc phải true vì FE gửi JWT trong header mỗi request
        config.setAllowCredentials(true);

        // Kết quả preflight (OPTIONS) được cache ở browser bao lâu (giây)
        // 3600 = 1 giờ → browser không phải gửi OPTIONS mỗi lần, giảm latency
        config.setMaxAge(3600L);

        // Áp dụng config trên cho TẤT CẢ các path ("/**")
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
