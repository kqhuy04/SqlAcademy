package com.example.be.service;

import com.example.be.dto.CustomUserDetail;
import com.example.be.dto.request.SQLQueryRequest;
import com.example.be.dto.request.EndCaseRequest;
import com.example.be.dto.response.*;
import com.example.be.entity.*;
import com.example.be.exception.CaseQuestionNotFoundException;
import com.example.be.exception.PremiumCaseNotFoundException;
import com.example.be.exception.SubscriptionNotPurchasedException;
import com.example.be.exception.UserNotFoundException;
import com.example.be.repository.*;
import com.example.be.util.SecurityUtil;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PremiumCaseService {

    private final PremiumCaseRepository premiumCaseRepository;

    private final CaseQuestionRepository caseQuestionRepository;

    private final JdbcTemplate jdbcTemplate;

    private final UserRepository userRepository;

    private final UserCaseProgressRepository userCaseProgressRepository;

    private final CaseTableRepository caseTableRepository;

    private final CaseColumnRepository caseColumnRepository;

    PremiumCaseService(PremiumCaseRepository premiumCaseRepository,
                       CaseQuestionRepository caseQuestionRepository,
                       JdbcTemplate jdbcTemplate,
                       UserCaseProgressRepository userCaseProgressRepository,
                       UserRepository userRepository,
                       CaseTableRepository caseTableRepository,
                       CaseColumnRepository caseColumnRepository) {
        this.premiumCaseRepository = premiumCaseRepository;
        this.caseQuestionRepository = caseQuestionRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.userCaseProgressRepository = userCaseProgressRepository;
        this.userRepository = userRepository;
        this.caseTableRepository = caseTableRepository;
        this.caseColumnRepository = caseColumnRepository;
    }

    public PremiumCaseListResponse getPremiumCases() {
        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        List<PremiumCase> premiumCaseList = premiumCaseRepository.findAll();
        return new PremiumCaseListResponse(premiumCaseList.stream().map(
                        premiumCase -> PremiumCaseDTO.builder()
                                .id(premiumCase.getId())
                                .title(premiumCase.getTitle())
                                .description(premiumCase.getDescription())
                                .difficulty(premiumCase.getDifficulty())
                                .hint(premiumCase.getHint())
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
        if (customUserDetail.getIsPurchased() == false) {
            throw new SubscriptionNotPurchasedException("Subcription is not purchased");
        }
        List<CaseQuestionDTO> list = caseQuestionList.stream().map(
                caseQuestion -> CaseQuestionDTO.builder()
                        .id(caseQuestion.getId())
                        .orderIndex(caseQuestion.getOrderIndex())
                        .questionVi(caseQuestion.getQuestionVi())
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
                .hint(premiumCase.getHint())
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
        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        if (customUserDetail.getIsPurchased() == false) {
            throw new SubscriptionNotPurchasedException("Subcription is not purchased");
        }
        jdbcTemplate.execute("USE case_" + sqlQueryRequest.caseId());
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sqlQueryRequest.query());
        return new SQLQueryResponse(rows);
    }

    @Transactional
    public EndCaseResponse endCase(EndCaseRequest endCaseRequest) {
        CaseQuestion caseQuestion = caseQuestionRepository
                .findById(endCaseRequest.questionId())
                .orElseThrow(() -> new CaseQuestionNotFoundException("Question not found"));

        if (!endCaseRequest.answer().equalsIgnoreCase(caseQuestion.getExpectedOutput())) {
            return new EndCaseResponse("Wrong answer", false, 0, 0);
        }

        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        User user = userRepository.findById(customUserDetail.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        boolean alreadyDone = userCaseProgressRepository
                .existsByUserIdAndCaseQuestionId(user.getId(), caseQuestion.getId());
        if (alreadyDone) {
            return new EndCaseResponse("Already completed", true, 0, 0);
        }

        PremiumCase premiumCase = caseQuestion.getPremiumCase();
        int base = premiumCase.getBaseScore() != null ? premiumCase.getBaseScore() : 100;
        int hintPenalty   = endCaseRequest.hintsUsed() * (base / 5);
        int attemptPenalty = Math.max(0, endCaseRequest.attempts() - 1) * (base / 10);
        int scoreEarned = Math.max(0, base - hintPenalty - attemptPenalty);

        int xpEarned = premiumCase.getXpReward() != null ? premiumCase.getXpReward() : 0;

        UserCaseProgress progress = UserCaseProgress.builder()
                .user(user)
                .premiumCase(premiumCase)
                .caseQuestion(caseQuestion)
                .status("Completed")
                .scoreEarned(scoreEarned)
                .hintsUsed(endCaseRequest.hintsUsed())
                .attempts(endCaseRequest.attempts())
                .completedAt(LocalDateTime.now())
                .build();
        userCaseProgressRepository.save(progress);

        user.setTotalScore(user.getTotalScore() + scoreEarned);
        user.setTotalXp(user.getTotalXp() + xpEarned);

        long completedCount = userCaseProgressRepository
                .countByUserIdAndPremiumCaseId(user.getId(), premiumCase.getId());
        boolean justFinishedCase = (completedCount >= premiumCase.getQuestionCount());
        if (justFinishedCase && premiumCase.getBadgeIcon() != null) {
            String existing = user.getBadgesEarned() != null ? user.getBadgesEarned() : "";
            if (!existing.contains(premiumCase.getBadgeIcon())) {
                String updated = existing.isEmpty()
                        ? premiumCase.getBadgeIcon()
                        : existing + "," + premiumCase.getBadgeIcon();
                user.setBadgesEarned(updated);
            }
        }

        userRepository.save(user);

        return new EndCaseResponse("Correct!", true, scoreEarned, xpEarned);
    }

    public GetTableResponse getTables(Long id) {
        if (!premiumCaseRepository.existsById(id)) {
            throw new PremiumCaseNotFoundException("Premium Case not found");
        }

        List<CaseTable> caseTableList = caseTableRepository.findByPremiumCaseId(id);
        List<CaseColumn> allColumns = caseColumnRepository.findByCaseTablePremiumCaseId(id);
        Map<Long, List<CaseColumn>> columnsByTableId = allColumns.stream()
                .collect(Collectors.groupingBy(c -> c.getCaseTable().getId()));

        return new GetTableResponse(
                caseTableList
                        .stream()
                        .map(caseTable -> TableDTO
                                .builder()
                                .tableName(caseTable.getTableName())
                                .descriptionVi(caseTable.getDescriptionVi())
                                .descriptionEn(caseTable.getDescriptionEn())
                                .sampleData(caseTable.getSampleData())
                                .columnDTOList(
                                        columnsByTableId.getOrDefault(caseTable.getId(), List.of())
                                                .stream()
                                                .map(caseColumn -> ColumnDTO
                                                        .builder()
                                                        .columnName(caseColumn.getColumnName())
                                                        .dataType(caseColumn.getDataType())
                                                        .isPrimaryKey(caseColumn.getIsPrimaryKey())
                                                        .descriptionVi(caseColumn.getDescriptionVi())
                                                        .descriptionEn(caseColumn.getDescriptionEn())
                                                        .sampleValues(caseColumn.getSampleValues())
                                                        .build()
                                                )
                                                .toList()
                                )
                                .build())
                        .toList()
        );
    }
}
