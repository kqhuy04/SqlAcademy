package com.example.be.exception;

public class PremiumCaseNotFoundException extends RuntimeException {
    public PremiumCaseNotFoundException(String message) {
        super(message);
    }
}
