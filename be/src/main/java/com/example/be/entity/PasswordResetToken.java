package com.example.be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@EntityListeners(AuditingEntityListener.class)
@Entity
@Table(name = "password_reset_tokens")
@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "token", unique = true, nullable = false)
    String token;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    User user;

    @Column(name = "expired_at", nullable = false)
    LocalDateTime expiredAt;

    @Builder.Default
    @Column(name = "used")
    Boolean used = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    LocalDateTime createAt;
}
