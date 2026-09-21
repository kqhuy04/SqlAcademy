package com.example.be.controller;

import com.example.be.enums.PaymentGateway;
import com.example.be.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/payments/webhook")
public class PaymentWebhookController {

    private final PaymentService paymentService;

    public PaymentWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // 1. Dành cho VNPay IPN (VNPay gọi qua GET kèm query params)
    @GetMapping("/VNPAY")
    public ResponseEntity<Map<String, String>> handleVnPayIpn(@RequestParam Map<String, String> queryParams) {
        try {
            // Chuyển params thành query string dạng k1=v1&k2=v2
            String rawQuery = queryParams.entrySet().stream()
                    .map(e -> e.getKey() + "=" + e.getValue())
                    .collect(Collectors.joining("&"));

            paymentService.processWebhook(PaymentGateway.VNPAY, rawQuery, Map.of());

            // Format phản hồi bắt buộc của VNPay
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid Checksum or Error"));
        }
    }

    // 2. Dành cho Lemon Squeezy (gọi qua POST với raw JSON body)
    @PostMapping("/{gateway}")
    public ResponseEntity<String> handleWebhookPost(
            @PathVariable PaymentGateway gateway,
            @RequestBody String rawBody,
            @RequestHeader Map<String, String> headers) {

        paymentService.processWebhook(gateway, rawBody, headers);
        return ResponseEntity.ok("OK");
    }
}