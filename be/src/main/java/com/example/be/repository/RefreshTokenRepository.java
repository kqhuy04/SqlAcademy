package com.example.be.repository;

import com.example.be.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    List<RefreshToken> findByUserId(Long userId);

    @Query("SELECT r FROM RefreshToken r JOIN FETCH r.user WHERE r.token = :refreshToken")
    Optional<RefreshToken> findByToken(@Param("refreshToken") String refreshToken);

    @Modifying
    @Query("DELETE FROM RefreshToken u where u.expiredAt < :now")
    void deleteByExpiredAtBefore(@Param("now") LocalDateTime now);
}