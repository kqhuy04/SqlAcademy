package com.example.be.exception;

import org.aspectj.bridge.IMessage;

public class RefreshTokenInvalidException extends RuntimeException {
    public RefreshTokenInvalidException(String message) {
        super(message);
    }
}
