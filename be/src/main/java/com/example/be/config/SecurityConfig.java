package com.example.be.config;

import com.example.be.util.CustomJwtAuthenticationConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final CustomJwtAuthenticationConverter customJwtAuthenticationConverter;
    private final JwtDecoder jwtDecoder;

    // Đọc từ application.properties — dễ thay đổi theo môi trường (dev/prod)
    // mà không cần sửa code Java
    @Value("${cors.allowed-origins}")
    private String allowedOrigins;

    public SecurityConfig(CustomJwtAuthenticationConverter customJwtAuthenticationConverter,
                          JwtDecoder jwtDecoder) {
        this.customJwtAuthenticationConverter = customJwtAuthenticationConverter;
        this.jwtDecoder = jwtDecoder;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Khai báo CORS ở đây để Spring Security xử lý preflight OPTIONS request
                // TRƯỚC KHI vào authentication filter.
                // Nếu không làm vậy, request OPTIONS từ browser sẽ bị block với 401
                // vì nó không mang Authorization header → FE sẽ báo CORS error dù BE đúng
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(
                        auth -> auth
                                .requestMatchers("/api/v1/auth/**", "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
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
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));

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
