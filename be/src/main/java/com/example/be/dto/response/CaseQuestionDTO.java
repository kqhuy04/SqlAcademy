package com.example.be.dto.response;

import lombok.Builder;

@Builder
public record CaseQuestionDTO(
        Integer orderIndex,
        String questionVi,
        String questionEn,
        String hint1,
        String hint2,
        String hint3,
        String skillTags
) {
}
