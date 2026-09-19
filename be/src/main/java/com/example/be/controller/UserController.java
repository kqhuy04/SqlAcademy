package com.example.be.controller;

import com.example.be.annotation.Idempotent;
import com.example.be.dto.request.ChangePasswordRequest;
import com.example.be.dto.request.DeleteUserRequest;
import com.example.be.dto.request.SubscriptionRequest;
import com.example.be.dto.response.*;
import com.example.be.service.RefreshTokenService;
import com.example.be.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    private final RefreshTokenService refreshTokenService;

    UserController(UserService userService, RefreshTokenService refreshTokenService) {
        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
    }

    @Idempotent
    @PatchMapping("/me/subscriptions")
    public ResponseEntity<SubscriptionResponse> subscribe(@Valid @RequestBody SubscriptionRequest subscriptionRequest) {
        return ResponseEntity.ok(userService.purchase(subscriptionRequest));
    }

    @DeleteMapping("/me")
    public ResponseEntity<DeleteUserResponse> deleteUser(@Valid @RequestBody DeleteUserRequest deleteUserRequest) {
        return ResponseEntity.ok(userService.deleteUser(deleteUserRequest));
    }

    @GetMapping("/users/me")
    public ResponseEntity<UserProfileResponse> getMe() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @GetMapping("/users/me/progress")
    public ResponseEntity<List<UserProgressResponse>> getProgress() {
        return ResponseEntity.ok(userService.getProgress());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntryResponse>> getLeaderboard() {
        return ResponseEntity.ok(userService.getLeaderboard());
    }

    @Idempotent
    @PatchMapping("/users/me/password")
    public ResponseEntity<ChangePasswordResponse> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        return ResponseEntity.ok(userService.changePassword(changePasswordRequest));
    }
}
