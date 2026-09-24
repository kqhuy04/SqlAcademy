package com.example.be.annotationImp;

import com.example.be.annotation.SQLQueryValid;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.util.List;

public class SQLQueryValidator implements ConstraintValidator<SQLQueryValid, String> {
    private static final List<String> FORBIDDEN_KEYWORDS = List.of(
            "INSERT", "UPDATE", "DELETE", "DROP", "ALTER",
            "TRUNCATE", "EXEC", "EXECUTE", "GRANT", "REVOKE",
            "REPLACE", "CALL", "LOAD", "IMPORT", "CREATE", "USE",
            "INTO", "OUTFILE", "DUMPFILE" // <-- Thêm các từ khóa ghi file này
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

        // 1. Loại bỏ comments (cả multi-line /* */ và single-line -- hoặc #)
        String withoutComments = s.replaceAll("(?s)/\\*.*?\\*/", "");
        withoutComments = withoutComments.replaceAll("(?m)(--|#).*?$", "");

        String normalized = withoutComments.trim().toUpperCase();
        if (normalized.isEmpty()) {
            buildMessage(constraintValidatorContext, "Query cannot be empty");
            return false;
        }

        // 2. Chỉ cho phép bắt đầu bằng SELECT hoặc WITH (cho CTE)
        if (!normalized.startsWith("SELECT") && !normalized.startsWith("WITH")) {
            buildMessage(constraintValidatorContext, "ONLY SELECT statement is allowed");
            return false;
        }

        // 3. Kiểm tra từ khóa bị cấm (dùng (?s) để quét qua nhiều dòng)
        for (String keyword : FORBIDDEN_KEYWORDS) {
            if (normalized.matches("(?s).*\\b" + keyword + "\\b.*")) {
                buildMessage(constraintValidatorContext, "FORBIDDEN KEYWORD detected: " + keyword);
                return false;
            }
        }

        // 4. Kiểm tra schema bị cấm (loại bỏ backtick để chống obfuscation)
        String unquoted = normalized.replace("`", "");
        for (String schema : FORBIDDEN_SCHEMAS) {
            if (unquoted.matches("(?s).*\\b" + schema + "\\b.*")) {
                buildMessage(constraintValidatorContext, "FORBIDDEN SCHEMAS detected: " + schema);
                return false;
            }
        }

        // 5. Kiểm tra hàm bị cấm
        for (String function : FORBIDDEN_FUNCTIONS) {
            if (normalized.matches("(?s).*\\b" + function + "\\b.*")) {
                buildMessage(constraintValidatorContext, "FORBIDDEN FUNCTIONS detected: " + function);
                return false;
            }
        }

        // 6. Kiểm tra multiple queries: loại bỏ dấu ; ở cuối cùng trước khi kiểm tra
        String cleaned = normalized.replaceAll(";\\s*$", "");
        if (cleaned.contains(";")) {
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
