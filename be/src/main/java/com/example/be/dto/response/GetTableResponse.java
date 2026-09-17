package com.example.be.dto.response;

import java.util.List;

public record GetTableResponse(
        List<TableDTO> tables
) {
}
