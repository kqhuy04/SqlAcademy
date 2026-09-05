package com.example.be.service;

import com.example.be.dto.CustomUserDetail;
import com.example.be.dto.response.PremiumCaseItemResponse;
import com.example.be.dto.response.PremiumCaseListResponse;
import com.example.be.entity.PremiumCase;
import com.example.be.exception.UnauthenticatedException;
import com.example.be.repository.PremiumCaseRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PremiumCaseService {

    private final PremiumCaseRepository premiumCaseRepository;

    PremiumCaseService(PremiumCaseRepository premiumCaseRepository) {
        this.premiumCaseRepository = premiumCaseRepository;
    }

    public PremiumCaseListResponse getPremiumCaseList() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthenticatedException("User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof CustomUserDetail customUserDetail) {
            List<PremiumCase> premiumCaseList = premiumCaseRepository.findAll();
            return new PremiumCaseListResponse(premiumCaseList.stream().map(
                            premiumCase -> PremiumCaseItemResponse.builder()
                                    .id(premiumCase.getId())
                                    .title(premiumCase.getTitle())
                                    .description(premiumCase.getDescription())
                                    .difficulty(premiumCase.getDifficulty())
                                    .orderIndex(premiumCase.getOrderIndex())
                                    .baseScore(premiumCase.getBaseScore())
                                    .xpReward(premiumCase.getXpReward())
                                    .badgeName(premiumCase.getBadgeName())
                                    .badgeIcon(premiumCase.getBadgeIcon())
                                    .questionCount(premiumCase.getQuestionCount())
                                    .isUnlocked(customUserDetail.getIsPurchased())
                                    .build())
                    .toList());
        } else {
            throw new UnauthenticatedException("User is not authenticated");
        }

    }
}
