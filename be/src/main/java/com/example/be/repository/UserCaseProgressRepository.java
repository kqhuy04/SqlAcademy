package com.example.be.repository;

import com.example.be.entity.UserCaseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserCaseProgressRepository extends JpaRepository<UserCaseProgress, Long> {

    boolean existsByUserIdAndCaseQuestionId(Long userId, Long caseQuestionId);

    long countByUserIdAndPremiumCaseId(Long userId, Long premiumCaseId);

    List<UserCaseProgress> findByUserId(Long userId);

    void deleteByUserId(Long userId);

    long countByUserId(Long userId);
}
