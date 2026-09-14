package com.example.be.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record EndCaseRequest(

        @Min(1)
        @Max(50)
        Long caseId,

        @Min(1)
        @Max(3)
        Long caseQuestion
) {
}
