package com.example.be.controller;

import com.example.be.dto.response.PremiumCaseListResponse;
import com.example.be.service.PremiumCaseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PremiumCaseController {

    private final PremiumCaseService premiumCaseService;

    PremiumCaseController(PremiumCaseService premiumCaseService) {
        this.premiumCaseService = premiumCaseService;
    }

    @GetMapping("/premium_cases")
    public ResponseEntity<PremiumCaseListResponse> getAllPremiuCases() {
        return ResponseEntity.ok(premiumCaseService.getPremiumCaseList());
    }

}
