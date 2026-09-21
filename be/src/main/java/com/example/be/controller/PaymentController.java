package com.example.be.controller;

import com.example.be.enums.PaymentGateway;
import com.example.be.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, String>> checkout(@RequestParam PaymentGateway gateway) {
        String paymentUrl = paymentService.createOrder(gateway);
        return ResponseEntity.ok(Map.of("paymentUrl", paymentUrl));
    }

    @GetMapping("/orders/{orderCode}/status")
    public ResponseEntity<Map<String, Object>> getOrderStatus(@PathVariable Long orderCode) {
        return ResponseEntity.ok(paymentService.getOrderStatus(orderCode));
    }
}