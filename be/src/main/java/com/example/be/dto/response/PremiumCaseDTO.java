package com.example.be.dto.response;
import lombok.Builder;

import java.util.List;

@Builder

public record PremiumCaseDTO(
        Long id,
        String title,
        String description,
        String difficulty,
        String hint,
        Integer orderIndex,
        Integer baseScore,
        String badgeName,
        String badgeIcon,
        Integer questionCount,
        boolean isUnlocked,
        List<CaseQuestionDTO> caseQuestionDTOList

        
) {
}
