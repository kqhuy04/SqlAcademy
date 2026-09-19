package com.example.be.controller;

import com.example.be.annotation.Idempotent;
import com.example.be.dto.request.SQLQueryRequest;
import com.example.be.dto.request.EndCaseRequest;
import com.example.be.dto.response.*;
import com.example.be.service.PremiumCaseService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@Validated
public class PremiumCaseController {

    private final PremiumCaseService premiumCaseService;

    PremiumCaseController(PremiumCaseService premiumCaseService) {
        this.premiumCaseService = premiumCaseService;
    }

    @GetMapping("/premium_cases")
    public ResponseEntity<PremiumCaseListResponse> getPremiumCases() {
        return ResponseEntity.ok(premiumCaseService.getPremiumCases());
    }

    @GetMapping("/premium_cases/{id}")
    public ResponseEntity<PremiumCaseDTO> getPremiumCase(@PathVariable("id") Long id) {
        return ResponseEntity.ok(premiumCaseService.getPremiumCase(id));
    }

    @Idempotent
    @PostMapping("/premium_cases/run")
    public ResponseEntity<SQLQueryResponse> runQuery(@RequestBody @Valid SQLQueryRequest sqlQueryRequest) {
        return ResponseEntity.ok(premiumCaseService.runQuery(sqlQueryRequest));
    }

    @Idempotent
    @PostMapping("/premium_cases/end")
    public ResponseEntity<EndCaseResponse> endCase(@RequestBody @Valid EndCaseRequest endCaseRequest) {
        return ResponseEntity.ok(premiumCaseService.endCase(endCaseRequest));
    }

    @GetMapping("/premium_cases/{id}/tables")
    public ResponseEntity<GetTableResponse> getTables(@PathVariable("id") @Min(1) @Max(20) Long id) {
        return ResponseEntity.ok(premiumCaseService.getTables(id));
    }

}
