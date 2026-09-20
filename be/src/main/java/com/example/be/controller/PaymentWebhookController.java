package com.example.be.controller;

import com.example.be.enums.PaymentGateway;
import com.example.be.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments/webhook")
public class PaymentWebhookController {

    private final PaymentService paymentService;

    public PaymentWebhookController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/{gateway}")
    public ResponseEntity<String> handleWebhook(
            @PathVariable PaymentGateway gateway,
            @RequestBody String rawBody,
            @RequestHeader Map<String, String> headers) {

        paymentService.processWebhook(gateway, rawBody, headers);
        return ResponseEntity.ok("OK"); // Trả về 200 OK cho Cổng thanh toán biết đã nhận
    }
}