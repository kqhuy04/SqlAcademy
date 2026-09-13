package com.example.be.repository;

import com.example.be.entity.PremiumCase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PremiumCaseRepository extends JpaRepository<PremiumCase, Long> {
    Optional<PremiumCase> findById(Long id);


}
