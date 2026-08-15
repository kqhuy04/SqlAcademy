package com.example.be.dto.request;

import jakarta.validation.constraints.*;

public record RegisterRequest(
        @NotBlank(message = "Username is required")
        @Size(min = 5, max = 30, message = "User must be between 5 and 30 characters")
        String username,

        @NotBlank
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$", message = "Password need at least 1 upcase letter, 1 number, 1 special character ")
        String password) {

}
