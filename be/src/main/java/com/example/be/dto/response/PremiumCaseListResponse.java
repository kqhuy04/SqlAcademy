package com.example.be.dto.response;

import java.util.List;

public record PremiumCaseListResponse(
        List<PremiumCaseDTO> premiumCaseDTOList,
        int currentPage,
        int totalPages,
        long totalElements,
        boolean hasNext
) {
    public PremiumCaseListResponse(List<PremiumCaseDTO> premiumCaseDTOList) {
        this(premiumCaseDTOList, 0, 1, premiumCaseDTOList != null ? premiumCaseDTOList.size() : 0, false);
    }
}
