package com.example.be.dto.response;

import lombok.Builder;

@Builder
public record ColumnDTO(
        String columnName,
        String dataType,
        Boolean isPrimaryKey,
        String descriptionVi,
        String descriptionEn,
        String sampleValues
) {
}
