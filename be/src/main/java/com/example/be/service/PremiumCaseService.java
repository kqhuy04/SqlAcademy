package com.example.be.service;

import com.example.be.dto.CustomUserDetail;
import com.example.be.dto.request.SQLQueryRequest;
import com.example.be.dto.response.CaseQuestionDTO;
import com.example.be.dto.response.PremiumCaseDTO;
import com.example.be.dto.response.PremiumCaseListResponse;
import com.example.be.dto.response.SQLQueryResponse;
import com.example.be.entity.CaseQuestion;
import com.example.be.entity.PremiumCase;
import com.example.be.exception.PremiumCaseNotFoundException;
import com.example.be.exception.UnauthenticatedException;
import com.example.be.repository.CaseQuestionRepository;
import com.example.be.repository.PremiumCaseRepository;
import com.example.be.util.SecurityUtil;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PremiumCaseService {

    private final PremiumCaseRepository premiumCaseRepository;

    private final CaseQuestionRepository caseQuestionRepository;

    private final JdbcTemplate jdbcTemplate;

    PremiumCaseService(PremiumCaseRepository premiumCaseRepository, CaseQuestionRepository caseQuestionRepository, JdbcTemplate jdbcTemplate) {
        this.premiumCaseRepository = premiumCaseRepository;
        this.caseQuestionRepository = caseQuestionRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    public PremiumCaseListResponse getPremiumCaseList() {
        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        List<PremiumCase> premiumCaseList = premiumCaseRepository.findAll();
        return new PremiumCaseListResponse(premiumCaseList.stream().map(
                        premiumCase -> PremiumCaseDTO.builder()
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
                                .caseQuestionDTOList(null)
                                .build())
                .toList());
    }

    public PremiumCaseDTO getPremiumCase(Long id) {
        PremiumCase premiumCase = premiumCaseRepository.findById(id).orElseThrow(() -> new PremiumCaseNotFoundException("Premium Case not found"));
        List<CaseQuestion> caseQuestionList = caseQuestionRepository.findByPremiumCaseId(premiumCase.getId());
        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        List<CaseQuestionDTO> list = caseQuestionList.stream().map(
                caseQuestion -> CaseQuestionDTO.builder()
                        .orderIndex(caseQuestion.getOrderIndex())
                        .questionEn(caseQuestion.getQuestionVi())
                        .questionEn(caseQuestion.getQuestionEn())
                        .hint1(caseQuestion.getHint1())
                        .hint2(caseQuestion.getHint2())
                        .hint3(caseQuestion.getHint3())
                        .skillTags(caseQuestion.getSkillTags()).build()
        ).toList();
        return PremiumCaseDTO.builder()
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
                .caseQuestionDTOList(list)
                .build();

    }

    public SQLQueryResponse runQuery(SQLQueryRequest sqlQueryRequest) {
        jdbcTemplate.execute("USE case_" + sqlQueryRequest.caseId());
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sqlQueryRequest.query());
        return new SQLQueryResponse(rows);
    }
}
