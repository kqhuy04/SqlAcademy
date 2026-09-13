package com.example.be.repository;

import com.example.be.entity.CaseQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CaseQuestionRepository extends JpaRepository<CaseQuestion, Long> {
    List<CaseQuestion> findByPremiumCaseId(Long id);
}
