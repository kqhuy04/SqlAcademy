package com.example.be.controller;

import com.example.be.dto.request.*;
import com.example.be.dto.response.*;
import com.example.be.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class UserController {
    private final UserService userService;

    UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterReponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(userService.createUser(registerRequest));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.readUser(loginRequest));
    }

    @PatchMapping("/users/me/subscriptions")
    public ResponseEntity<SubscriptionResponse> subscribe(@Valid @RequestBody SubscriptionRequest subscriptionRequest) {
        return ResponseEntity.ok(userService.purchase(subscriptionRequest));
    }

    @PatchMapping("/users/me/password")
    public ResponseEntity<ChangePasswordResponse> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        return ResponseEntity.ok(userService.changePassword(changePasswordRequest));
    }

    @PostMapping("/users/me/password")
    public ResponseEntity<ForgetPasswordResponse> changePassword(@Valid @RequestBody ForgetPasswordRequest forgetPasswordRequest) {
        return ResponseEntity.ok(userService.forgetPassword(forgetPasswordRequest));
    }

}
