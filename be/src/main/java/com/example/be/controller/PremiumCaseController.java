package com.example.be.controller;

import com.example.be.dto.request.SQLQueryRequest;
import com.example.be.dto.request.EndCaseRequest;
import com.example.be.dto.response.PremiumCaseDTO;
import com.example.be.dto.response.PremiumCaseListResponse;
import com.example.be.dto.response.SQLQueryResponse;
import com.example.be.dto.response.EndCaseResponse;
import com.example.be.service.PremiumCaseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class PremiumCaseController {

    private final PremiumCaseService premiumCaseService;

    PremiumCaseController(PremiumCaseService premiumCaseService) {
        this.premiumCaseService = premiumCaseService;
    }

    @GetMapping("/premium_cases")
    public ResponseEntity<PremiumCaseListResponse> getAllPremiumCases() {
        return ResponseEntity.ok(premiumCaseService.getPremiumCaseList());
    }

    @GetMapping("/premium_cases/{id}")
    public ResponseEntity<PremiumCaseDTO> getPremiumCase(@PathVariable("id") Long id) {
        return ResponseEntity.ok(premiumCaseService.getPremiumCase(id));
    }

    @PostMapping("/premium_cases/run")
    public ResponseEntity<SQLQueryResponse> runQuery(@RequestBody @Valid SQLQueryRequest sqlQueryRequest) {
        return ResponseEntity.ok(premiumCaseService.runQuery(sqlQueryRequest));
    }

    @PostMapping("/premium_cases/start")
    public ResponseEntity<EndCaseResponse> startCase(@RequestBody EndCaseRequest endCaseRequest) {
        return ResponseEntity.ok(premiumCaseService.endCase(endCaseRequest));
    }
}
