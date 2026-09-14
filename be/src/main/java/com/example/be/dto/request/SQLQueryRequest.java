package com.example.be.dto.request;

import com.example.be.annotation.SQLQueryValidation;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;

public record SQLQueryRequest (
        @NotBlank(message = "Case Id is blank")
        @Min(1)
        @Max(50)
        Long caseId,

        @SQLQueryValidation
        String query
) {
}
