package com.example.be.exception;

public class PasswordResetTokenNotFound extends RuntimeException {
    public PasswordResetTokenNotFound(String message) {
        super(message);
    }
}
