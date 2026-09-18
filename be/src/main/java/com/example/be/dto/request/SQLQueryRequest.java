package com.example.be.dto.request;

import com.example.be.annotation.SQLQueryValid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SQLQueryRequest(
        @NotNull(message = "Case Id is required")
        @Min(1)
        @Max(50)
        Long caseId,

        @SQLQueryValid
        String query
) {
}
