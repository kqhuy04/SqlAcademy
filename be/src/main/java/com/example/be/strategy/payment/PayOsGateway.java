package com.example.be.strategy.payment;

import com.example.be.entity.Order;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;
import vn.payos.model.webhooks.Webhook;
import vn.payos.model.webhooks.WebhookData;

import java.util.Map;

@Slf4j
@Component
public class PayOsGateway implements PaymentGatewayStrategy {

    private final PayOS payOS;
    private final ObjectMapper objectMapper;
    private final String returnUrl;
    private final String cancelUrl;

    public PayOsGateway(
            @Value("${payos.client-id}") String clientId,
            @Value("${payos.api-key}") String apiKey,
            @Value("${payos.checksum-key}") String checksumKey,
            @Value("${payos.return-url}") String returnUrl,
            @Value("${payos.cancel-url}") String cancelUrl,
            ObjectMapper objectMapper) {
        this.payOS = new PayOS(clientId, apiKey, checksumKey);
        this.objectMapper = objectMapper;
        this.returnUrl = returnUrl;
        this.cancelUrl = cancelUrl;
    }

    @Override
    public String createPaymentUrl(Order order) {
        try {
            long amountLong = order.getAmount().longValue();

            // QUY TẮC PAYOS: Description tối đa 25 ký tự, không dấu
            String description = "Don hang " + order.getOrderCode();
            if (description.length() > 25) {
                description = description.substring(0, 25);
            }

            PaymentLinkItem item = PaymentLinkItem.builder()
                    .name("SQL Police Premium")
                    .quantity(1)
                    .price(amountLong)
                    .build();

            CreatePaymentLinkRequest request = CreatePaymentLinkRequest.builder()
                    .orderCode(order.getOrderCode())
                    .amount(amountLong)
                    .description(description)
                    .returnUrl(returnUrl + "?orderCode=" + order.getOrderCode())
                    .cancelUrl(cancelUrl + "?orderCode=" + order.getOrderCode())
                    .item(item)
                    .build();

            CreatePaymentLinkResponse response = payOS.paymentRequests().create(request);
            return response.getCheckoutUrl();
        } catch (Exception e) {
            log.error("PayOS createPaymentLink error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create PayOS payment link: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyWebhookSignature(String rawBody, Map<String, String> headers) {
        try {
            Webhook webhook = objectMapper.readValue(rawBody, Webhook.class);
            // SDK 2.0.1 verify trực tiếp qua payOS.webhooks()
            payOS.webhooks().verify(webhook);
            return true;
        } catch (Exception e) {
            log.warn("PayOS webhook verification failed: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public Long extractOrderCode(String rawBody) {
        try {
            Webhook webhook = objectMapper.readValue(rawBody, Webhook.class);
            WebhookData data = payOS.webhooks().verify(webhook);
            return data.getOrderCode();
        } catch (Exception e) {
            log.error("PayOS extractOrderCode error: {}", e.getMessage());
            throw new RuntimeException("Cannot extract orderCode from PayOS webhook");
        }
    }

    @Override
    public String extractTransactionRef(String rawBody) {
        try {
            Webhook webhook = objectMapper.readValue(rawBody, Webhook.class);
            WebhookData data = payOS.webhooks().verify(webhook);
            return data.getReference();
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }
}