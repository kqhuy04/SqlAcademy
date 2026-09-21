package com.example.be.strategy.payment;

import com.example.be.entity.Order;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;

@Slf4j
@Component
public class LemonSqueezyGateway implements PaymentGatewayStrategy {

    private static final String API_URL = "https://api.lemonsqueezy.com/v1/checkouts";
    private static final String HMAC_SHA256 = "HmacSHA256";

    private final String apiKey;
    private final String webhookSecret;
    private final String storeId;
    private final String variantId;
    private final String redirectUrl;
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public LemonSqueezyGateway(
            @Value("${lemonsqueezy.api-key}") String apiKey,
            @Value("${lemonsqueezy.webhook-secret}") String webhookSecret,
            @Value("${lemonsqueezy.store-id}") String storeId,
            @Value("${lemonsqueezy.variant-id}") String variantId,
            @Value("${lemonsqueezy.redirect-url}") String redirectUrl,
            ObjectMapper objectMapper) {
        this.apiKey = apiKey;
        this.webhookSecret = webhookSecret;
        this.storeId = storeId;
        this.variantId = variantId;
        this.redirectUrl = redirectUrl;
        this.objectMapper = objectMapper;
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(5));
        requestFactory.setReadTimeout(Duration.ofSeconds(10));
        this.restClient = RestClient.builder()
                .requestFactory(requestFactory)
                .build();
    }

    @Override
    public String createPaymentUrl(Order order) {
        try {
            Map<String, Object> payload = Map.of(
                    "data", Map.of(
                            "type", "checkouts",
                            "attributes", Map.of(
                                    "checkout_data", Map.of(
                                            "email", order.getUser().getEmail(),
                                            "custom", Map.of("order_code", order.getOrderCode().toString())
                                    ),
                                    "product_options", Map.of(
                                            "redirect_url", redirectUrl + "?orderCode=" + order.getOrderCode()
                                    )
                            ),
                            "relationships", Map.of(
                                    "store", Map.of("data", Map.of("type", "stores", "id", storeId)),
                                    "variant", Map.of("data", Map.of("type", "variants", "id", variantId))
                            )
                    )
            );

            String responseBody = restClient.post()
                    .uri(API_URL)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + apiKey)
                    .header(HttpHeaders.ACCEPT, "application/vnd.api+json")
                    .contentType(MediaType.parseMediaType("application/vnd.api+json"))
                    .body(payload)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(responseBody);
            return root.path("data").path("attributes").path("url").asText();
        } catch (Exception e) {
            log.error("LemonSqueezy createCheckout error: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create Lemon Squeezy checkout URL: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyWebhookSignature(String rawBody, Map<String, String> headers) {
        try {
            String signature = headers.entrySet().stream()
                    .filter(entry -> "x-signature".equalsIgnoreCase(entry.getKey()))
                    .map(Map.Entry::getValue)
                    .findFirst()
                    .orElse(null);

            if (signature == null || signature.isBlank()) {
                log.warn("Missing X-Signature header in Lemon Squeezy webhook");
                return false;
            }

            Mac hmac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            hmac.init(secretKeySpec);
            byte[] hash = hmac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));

            String computedSignature = HexFormat.of().formatHex(hash);

            return MessageDigest.isEqual(
                    computedSignature.getBytes(StandardCharsets.UTF_8),
                    signature.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception e) {
            log.error("LemonSqueezy signature verification error: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public Long extractOrderCode(String rawBody) {
        try {
            JsonNode root = objectMapper.readTree(rawBody);
            String orderCodeStr = root.path("meta").path("custom_data").path("order_code").asText();
            if (orderCodeStr == null || orderCodeStr.isBlank()) {
                throw new IllegalArgumentException("order_code missing in webhook custom_data");
            }
            return Long.parseLong(orderCodeStr);
        } catch (Exception e) {
            log.error("LemonSqueezy extractOrderCode error: {}", e.getMessage());
            throw new RuntimeException("Failed to extract orderCode from Lemon Squeezy webhook: " + e.getMessage());
        }
    }

    @Override
    public String extractTransactionRef(String rawBody) {
        try {
            JsonNode root = objectMapper.readTree(rawBody);
            return root.path("data").path("id").asText();
        } catch (Exception e) {
            return "UNKNOWN";
        }
    }
}