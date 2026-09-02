package com.example.be.dto.request;

import jakarta.validation.constraints.Email;

public record ResetPasswordRequest(
        @Email
        String email
) {
}
