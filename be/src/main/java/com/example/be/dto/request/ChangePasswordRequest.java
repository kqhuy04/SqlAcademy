package com.example.be.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ChangePasswordRequest(
        @NotBlank
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$", message = "Password need at least 1 upcase letter, 1 number, 1 special character ")
        String oldPassword,

        @NotBlank
        @Pattern(regexp = "^(?=.*[A-Z])(?=.*\\d)(?=.*[^a-zA-Z0-9]).{8,}$", message = "Password need at least 1 upcase letter, 1 number, 1 special character ")
        String newPassword
) {
}
