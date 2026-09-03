package com.example.be.controller;

import com.example.be.dto.CustomUserDetails;
import com.example.be.dto.request.*;
import com.example.be.dto.response.*;
import com.example.be.service.RefreshTokenService;
import com.example.be.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class AuthController {
    private final UserService userService;
    private final RefreshTokenService refreshTokenService;

    AuthController(UserService userService, RefreshTokenService refreshTokenService) {

        this.userService = userService;
        this.refreshTokenService = refreshTokenService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return ResponseEntity.ok(userService.createUser(registerRequest));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        return ResponseEntity.ok(userService.readUser(loginRequest));
    }

    @PatchMapping("/users/me/password")
    public ResponseEntity<ChangePasswordResponse> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        return ResponseEntity.ok(userService.changePassword(changePasswordRequest));
    }

    @PostMapping("/auth/reset-password")
    public ResponseEntity<ResetPasswordResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest resetPasswordRequest) {
        return ResponseEntity.ok(userService.resetPassword(resetPasswordRequest));
    }


    @GetMapping("/users/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal CustomUserDetails principal) {
        return ResponseEntity.ok(principal);
    }

    @PostMapping("/auth/refresh")
    public ResponseEntity<RefreshTokenResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest refreshTokenRequest) {
        return ResponseEntity.ok(refreshTokenService.getRefreshToken(refreshTokenRequest));
    }

    @PostMapping("/auth/logout")
    public ResponseEntity<LogoutResponse> logout(@Valid @RequestBody LogoutRequest logoutRequest) {
        return ResponseEntity.ok(refreshTokenService.logout(logoutRequest));
    }


}
