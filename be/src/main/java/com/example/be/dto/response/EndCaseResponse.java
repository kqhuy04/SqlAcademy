package com.example.be.dto.response;

public record EndCaseResponse(
        String message,
        Boolean correct,
        Integer scoreEarned,
        Integer xpEarned
) {
}
