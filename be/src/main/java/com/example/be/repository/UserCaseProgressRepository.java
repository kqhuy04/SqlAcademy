package com.example.be.repository;

import com.example.be.entity.UserCaseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserCaseProgressRepository extends JpaRepository<UserCaseProgress, Long> {

    boolean existsByUserIdAndCaseQuestionId(Long userId, Long caseQuestionId);

    boolean existsByUserIdAndCaseQuestionIdAndStatus(Long userId, Long caseQuestionId, String status);

    Optional<UserCaseProgress> findByUserIdAndCaseQuestionId(Long userId, Long caseQuestionId);

    long countByUserIdAndPremiumCaseId(Long userId, Long premiumCaseId);

    long countByUserIdAndPremiumCaseIdAndStatus(Long userId, Long premiumCaseId, String status);

    List<UserCaseProgress> findByUserId(Long userId);

    void deleteByUserId(Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);

    @Query("SELECT p FROM UserCaseProgress p " +
            "JOIN FETCH p.premiumCase " +
            "JOIN FETCH p.caseQuestion " +
            "WHERE p.user.id = :userId")
    List<UserCaseProgress> findByUserIdWithCaseAndQuestion(@Param("userId") Long userId);
}
