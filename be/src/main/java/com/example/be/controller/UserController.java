package com.example.be.controller;

import com.example.be.dto.request.SubscriptionRequest;
import com.example.be.dto.response.SubscriptionResponse;
import com.example.be.service.RefreshTokenService;
import com.example.be.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    UserController(UserService userService) {
        this.userService = userService;
    }
    @PatchMapping("/users/me/subscriptions")
    public ResponseEntity<SubscriptionResponse> subscribe(@Valid @RequestBody SubscriptionRequest subscriptionRequest) {
        return ResponseEntity.ok(userService.purchase(subscriptionRequest));
    }
}
