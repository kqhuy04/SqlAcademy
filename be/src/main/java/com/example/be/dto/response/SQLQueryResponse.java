package com.example.be.dto.response;

import java.util.List;
import java.util.Map;

public record SQLQueryResponse(
        List<Map<String, Object>> result
) {
}
