package com.example.be.validator;

import com.example.be.annotation.SQLQueryValidation;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.List;

public class SQLQueryValidator implements ConstraintValidator<SQLQueryValidation, String> {
    private static final List<String> FORBIDDEN_KEYWORDS = List.of(
            "INSERT", "UPDATE", "DELETE", "DROP", "ALTER",
            "TRUNCATE", "EXEC", "EXECUTE", "GRANT", "REVOKE",
            "REPLACE", "CALL", "LOAD", "IMPORT", "CREATE"
    );


    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        if (s.isBlank() || s == null) return false;

        String normalized = s.trim().toUpperCase();
//        if (!normalized.startsWith("SELCECT") && !normalized.startsWith("WITH")) {
//            buildMessage(constraintValidatorContext, "ONLY SELECT statement is allowed");
//            return false;
//        }

        for (String keyword : FORBIDDEN_KEYWORDS) {
            if (normalized.matches(".*\\b" + keyword + "\\b.*")) {
                buildMessage(constraintValidatorContext, "FORBIDDEN KEYWORD detected: " + keyword);
                return false;
            }
        }

        String [] list = normalized.split(";");
        if (list.length > 1) {
            buildMessage(constraintValidatorContext, "Multiple query is not allowed");
            return false;
        }
        return true;
    }

    private void buildMessage(ConstraintValidatorContext ctx, String msg) {
        ctx.disableDefaultConstraintViolation();
        ctx.buildConstraintViolationWithTemplate(msg)
                .addConstraintViolation();
    }
}
