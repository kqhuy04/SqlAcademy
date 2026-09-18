package com.example.be.service;

import com.example.be.dto.CustomUserDetail;
import com.example.be.dto.request.SQLQueryRequest;
import com.example.be.dto.request.EndCaseRequest;
import com.example.be.dto.response.*;
import com.example.be.entity.*;
import com.example.be.exception.*;
import com.example.be.repository.*;
import com.example.be.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
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

    private final DataSource sandboxDataSource;

    PremiumCaseService(PremiumCaseRepository premiumCaseRepository,
                       CaseQuestionRepository caseQuestionRepository,
                       JdbcTemplate jdbcTemplate,
                       UserCaseProgressRepository userCaseProgressRepository,
                       UserRepository userRepository,
                       CaseTableRepository caseTableRepository,
                       CaseColumnRepository caseColumnRepository,
                       @Qualifier("sandboxDataSource") DataSource sandboxDataSource) {
        this.premiumCaseRepository = premiumCaseRepository;
        this.caseQuestionRepository = caseQuestionRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.userCaseProgressRepository = userCaseProgressRepository;
        this.userRepository = userRepository;
        this.caseTableRepository = caseTableRepository;
        this.caseColumnRepository = caseColumnRepository;
        this.sandboxDataSource = sandboxDataSource;
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

        try (Connection conn = sandboxDataSource.getConnection()) {
            String originalCatalog = conn.getCatalog();
            try {
                conn.setCatalog("case_" + sqlQueryRequest.caseId());
                conn.setReadOnly(true);

                try (Statement stmt = conn.createStatement()) {
                    stmt.setQueryTimeout(3);
                    stmt.setMaxRows(10);

                    try (ResultSet rs = stmt.executeQuery(sqlQueryRequest.query())) {
                        List<Map<String, Object>> rows = new ArrayList<>();
                        ResultSetMetaData metaData = rs.getMetaData();
                        int columnCount = metaData.getColumnCount();

                        while (rs.next()) {
                            Map<String, Object> row = new LinkedHashMap<>();
                            for (int i = 1; i <= columnCount; i++) {
                                row.put(metaData.getColumnLabel(i), rs.getObject(i));
                            }
                            rows.add(row);
                        }
                        return new SQLQueryResponse(rows);
                    }
                }
            } finally {
                // BẮT BUỘC: Khôi phục lại trạng thái ban đầu cho Connection trước khi trả về HikariCP
                conn.setReadOnly(false);
                if (originalCatalog != null) {
                    conn.setCatalog(originalCatalog);
                }
            }
        } catch (SQLException e) {
            // Trả về thông điệp lỗi cú pháp MySQL thân thiện để học viên sửa bài
            throw new BadRequestException("SQL Execution Error: " + e.getMessage());
        }

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
