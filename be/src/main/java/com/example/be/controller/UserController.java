package com.example.be.controller;

import com.example.be.dto.request.DeleteUserRequest;
import com.example.be.dto.request.RefreshTokenRequest;
import com.example.be.dto.request.SubscriptionRequest;
import com.example.be.dto.response.DeleteUserResponse;
import com.example.be.dto.response.SubscriptionResponse;
import com.example.be.service.RefreshTokenService;
import com.example.be.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    private final RefreshTokenService refreshTokenService;

    UserController(UserService userService, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
    }
    @PatchMapping("/me/subscriptions")
    public ResponseEntity<SubscriptionResponse> subscribe(@Valid @RequestBody SubscriptionRequest subscriptionRequest) {
        return ResponseEntity.ok(userService.purchase(subscriptionRequest));
    }

    @DeleteMapping("/me")
    public ResponseEntity<DeleteUserResponse> deleteUser(@Valid @RequestBody DeleteUserRequest deleteUserRequest) {
        return ResponseEntity.ok(userService.deleteUser(deleteUserRequest));
    }
}
