package com.example.be.strategy.payment;

import com.example.be.entity.Order;

import java.util.Map;

public interface PaymentGatewayStrategy {
    String createPaymentUrl(Order order);

    boolean verifyWebhookSignature(String rawBody, Map<String, String> headers);

    Long extractOrderCode(String rawBody);

    String extractTransactionRef(String rawBody);
}
