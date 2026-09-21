package com.example.be.dto.response;

import lombok.Builder;

@Builder
public record CaseQuestionDTO(
        Long id,
        Integer orderIndex,
        String questionVi,
        String questionEn,
        String hint1,
        String hint2,
        String hint3,
        Boolean hasHint1,
        Boolean hasHint2,
        Boolean hasHint3,
        String skillTags
) {
}
