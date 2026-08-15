package com.example.be.dto.request;

public record CreateUserRequest(String email, String username, String passwordHash) {

}
