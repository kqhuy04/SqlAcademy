package com.example.be.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record EndCaseRequest(

        @Min(1)
        @Max(50)
        Long caseId,

        @Min(1)
        Long questionId,

        @NotBlank(message = "Answer can't be blank")
        String answer,

        @Min(0)
        @Max(3)
        int hintsUsed,

        @Min(1)
        int attempts
) {
}
