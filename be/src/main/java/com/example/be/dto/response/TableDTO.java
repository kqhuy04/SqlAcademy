package com.example.be.dto.response;

import lombok.Builder;

import java.util.List;

@Builder
public record TableDTO(
        String tableName,
        String descriptionVi,
        String descriptionEn,
        String sampleData,
        List<ColumnDTO> columnDTOList
) {

}
