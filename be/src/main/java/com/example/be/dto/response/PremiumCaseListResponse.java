package com.example.be.dto.response;

import java.util.List;

public record PremiumCaseListResponse(
        List<PremiumCaseDTO> premiumCaseDTOList
) {
}
