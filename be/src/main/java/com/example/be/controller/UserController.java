package com.example.be.controller;

import com.example.be.annotation.Idempotent;
import com.example.be.dto.request.*;
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

    @DeleteMapping("/me")
    public ResponseEntity<DeleteUserResponse> deleteUser(@Valid @RequestBody DeleteUserRequest deleteUserRequest) {
        return ResponseEntity.ok(userService.deleteUser(deleteUserRequest));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMe() {
        return ResponseEntity.ok(userService.getProfile());
    }

    @GetMapping("/me/progress")
    public ResponseEntity<List<UserProgressResponse>> getProgress() {
        return ResponseEntity.ok(userService.getProgress());
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<LeaderboardEntryResponse>> getLeaderboard() {
        return ResponseEntity.ok(userService.getLeaderboard());
    }

    @Idempotent
    @PatchMapping("/me/password")
    public ResponseEntity<ChangePasswordResponse> changePassword(@Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        return ResponseEntity.ok(userService.changePassword(changePasswordRequest));
    }

    @Idempotent
    @PatchMapping("/me/username")
    public ResponseEntity<ChangeUsernameResponse> changeUsername(@Valid @RequestBody ChangeUsernameRequest changeUsernameRequest) {
        return ResponseEntity.ok(userService.changeUsername(changeUsernameRequest));
    }

}
