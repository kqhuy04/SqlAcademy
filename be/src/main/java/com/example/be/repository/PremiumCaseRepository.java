package com.example.be.repository;

import com.example.be.entity.PremiumCase;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PremiumCaseRepository extends JpaRepository<PremiumCase, Long> {
    Optional<PremiumCase> findById(Long id);
}
