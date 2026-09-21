package com.example.be.service;

import com.example.be.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
public class DataCleanupService {

    private final RefreshTokenRepository refreshTokenRepository;

    DataCleanupService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    // Chạy vào 3h sáng mỗi ngày để dọn refresh token đã hết hạn
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupExpiredTokens() {
        log.info("Starting expired refresh tokens cleanup...");
        refreshTokenRepository.deleteByExpiredAtBefore(LocalDateTime.now());
    }
}
