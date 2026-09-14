package com.example.be.dto.request;

import com.example.be.annotation.SQLQueryValidation;

public record SQLQueryRequest (
        Integer caseId,

        @SQLQueryValidation
        String query
) {
}
