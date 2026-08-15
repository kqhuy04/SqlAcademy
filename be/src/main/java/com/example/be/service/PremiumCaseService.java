package com.example.be.service;

import com.example.be.repository.PremiumCaseRepository;
import org.springframework.stereotype.Service;

@Service
public class PremiumCaseService {

    private final PremiumCaseRepository premiumCaseRepository;

    PremiumCaseService(PremiumCaseRepository premiumCaseRepository) {
        this.premiumCaseRepository = premiumCaseRepository;
    }
}
