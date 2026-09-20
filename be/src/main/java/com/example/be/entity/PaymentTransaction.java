package com.example.be.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "payment_transactions", indexes = {
        @Index(name = "idx_tx_order", columnList = "order_id"),
        @Index(name = "idx_tx_ref", columnList = "transaction_ref")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "gateway", nullable = false, length = 30)
    private String gateway; // 'PAYOS', 'LEMON_SQUEEZY'

    @Column(name = "transaction_ref", length = 100)
    private String transactionRef; // Mã giao dịch do Cổng cấp (VD: PayOS reference ID)

    @Column(name = "amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // 'SUCCESS', 'FAILED'

    @Column(name = "raw_payload", columnDefinition = "LONGTEXT")
    private String rawPayload; // Lưu trọn vẹn JSON Webhook bắn sang để đối soát

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}