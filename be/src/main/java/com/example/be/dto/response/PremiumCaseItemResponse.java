package com.example.be.dto.response;
import lombok.Builder;

@Builder

public record PremiumCaseItemResponse(
        Long id,
        String title,
        String description,
        String difficulty,
        String hint,
        Integer orderIndex,
        Integer baseScore,
        Integer xpReward,
        String badgeName,
        String badgeIcon,
        Integer questionCount,
        boolean isUnlocked
) {
}
