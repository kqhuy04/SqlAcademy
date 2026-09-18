package com.example.be.annotationImp;

import com.example.be.annotation.SQLQueryValid;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.util.List;

public class SQLQueryValidator implements ConstraintValidator<SQLQueryValid, String> {
    private static final List<String> FORBIDDEN_KEYWORDS = List.of(
            "INSERT", "UPDATE", "DELETE", "DROP", "ALTER",
            "TRUNCATE", "EXEC", "EXECUTE", "GRANT", "REVOKE",
            "REPLACE", "CALL", "LOAD", "IMPORT", "CREATE", "USE"
    );

    private static final List<String> FORBIDDEN_SCHEMAS = List.of(
            "SQLPOLICEACADEMY", "INFORMATION_SCHEMA", "PERFORMANCE_SCHEMA", "MYSQL", "SYS"
    );

    private static final List<String> FORBIDDEN_FUNCTIONS = List.of(
            "SLEEP", "BENCHMARK", "SCHEMA", "DATABASE", "USER", "CURRENT_USER", "VERSION", "LOAD_FILE"
    );


    @Override
    public boolean isValid(String s, ConstraintValidatorContext constraintValidatorContext) {
        if (s == null || s.isBlank()) return false;

        String normalized = s.trim().toUpperCase();
        if (!normalized.startsWith("SELECT") && !normalized.startsWith("WITH")) {
            buildMessage(constraintValidatorContext, "ONLY SELECT statement is allowed");
            return false;
        }

        for (String keyword : FORBIDDEN_KEYWORDS) {
            if (normalized.matches(".*\\b" + keyword + "\\b.*")) {
                buildMessage(constraintValidatorContext, "FORBIDDEN KEYWORD detected: " + keyword);
                return false;
            }
        }

        for (String schema : FORBIDDEN_SCHEMAS) {
            if (normalized.matches(".*\\b" + schema + "\\b.*")) {
                buildMessage(constraintValidatorContext, "FORBIDDEN SCHEMAS detected: " + schema);
                return false;
            }
        }

        for (String function : FORBIDDEN_FUNCTIONS) {
            if (normalized.matches(".*\\b" + function + "\\b.*")) {
                buildMessage(constraintValidatorContext, "FORBIDDEN FUNCTIONS detected: " + function);
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
