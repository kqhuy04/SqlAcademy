package com.example.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChangeUsernameRequest(

        @NotBlank(message = "Username is required")
        @Size(min = 5, max = 30, message = "User must be between 5 and 30 characters")
        String username
) {
}
