package com.example.be.exception;

public class SubscriptionNotPurchasedException extends RuntimeException {
    public SubscriptionNotPurchasedException(String message) {
        super(message);
    }
}
