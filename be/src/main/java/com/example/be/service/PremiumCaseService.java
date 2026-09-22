package com.example.be.service;

import com.example.be.dto.CustomUserDetail;
import com.example.be.dto.request.SQLQueryRequest;
import com.example.be.dto.request.EndCaseRequest;
import com.example.be.dto.request.UnlockHintRequest;
import com.example.be.dto.response.*;
import com.example.be.entity.*;
import com.example.be.enums.UserEventType;
import com.example.be.exception.*;
import com.example.be.repository.*;
import com.example.be.util.SecurityUtil;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.DigestUtils;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;
import java.sql.*;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PremiumCaseService {

    private final PremiumCaseRepository premiumCaseRepository;

    private final CaseQuestionRepository caseQuestionRepository;

    private final UserRepository userRepository;

    private final UserCaseProgressRepository userCaseProgressRepository;

    private final CaseTableRepository caseTableRepository;

    private final CaseColumnRepository caseColumnRepository;

    private final DataSource sandboxDataSource;

    private final UserEventService userEventService;

    private final UserEventRepository userEventRepository;

    private final RedisTemplate<String, Object> redisTemplate;

    PremiumCaseService(PremiumCaseRepository premiumCaseRepository,
                       CaseQuestionRepository caseQuestionRepository,
                       UserCaseProgressRepository userCaseProgressRepository,
                       UserRepository userRepository,
                       CaseTableRepository caseTableRepository,
                       CaseColumnRepository caseColumnRepository,
                       @Qualifier("sandboxDataSource") DataSource sandboxDataSource,
                       UserEventService userEventService,
                       UserEventRepository userEventRepository,
                       RedisTemplate redisTemplate) {
        this.premiumCaseRepository = premiumCaseRepository;
        this.caseQuestionRepository = caseQuestionRepository;
        this.userCaseProgressRepository = userCaseProgressRepository;
        this.userRepository = userRepository;
        this.caseTableRepository = caseTableRepository;
        this.caseColumnRepository = caseColumnRepository;
        this.sandboxDataSource = sandboxDataSource;
        this.userEventService = userEventService;
        this.userEventRepository = userEventRepository;
        this.redisTemplate = redisTemplate;
    }

    @Cacheable(cacheNames = "premiumCases", key = "T(com.example.be.util.SecurityUtil).getCurrentUser().getIsPurchased()")
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
                                .badgeName(premiumCase.getBadgeName())
                                .badgeIcon(premiumCase.getBadgeIcon())
                                .questionCount(premiumCase.getQuestionCount())
                                .isUnlocked(customUserDetail.getIsPurchased())
                                .caseQuestionDTOList(null)
                                .build())
                .toList());
    }


    @PreAuthorize("principal.isPurchased == true")
    public PremiumCaseDTO getPremiumCase(Long id) {
        PremiumCase premiumCase = premiumCaseRepository.findById(id).orElseThrow(() -> new PremiumCaseNotFoundException("Premium Case not found"));
        List<CaseQuestion> caseQuestionList = caseQuestionRepository.findByPremiumCaseId(premiumCase.getId());
        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        String prefix = "caseId=" + premiumCase.getId() + ",%";
        List<String> unlockedEventMetas = userEventRepository
                .findMetadataByUserIdAndTypeAndPrefix(customUserDetail.getUserId(), UserEventType.HINT_USED, prefix);
        Set<String> unlockedHintsSet = new HashSet<>(unlockedEventMetas != null ? unlockedEventMetas : List.of());

        List<CaseQuestionDTO> list = caseQuestionList.stream().map(
                caseQuestion -> {
                    boolean hasH1 = caseQuestion.getHint1() != null && !caseQuestion.getHint1().isBlank();
                    boolean hasH2 = caseQuestion.getHint2() != null && !caseQuestion.getHint2().isBlank();
                    boolean hasH3 = caseQuestion.getHint3() != null && !caseQuestion.getHint3().isBlank();

                    boolean isH1Unlocked = unlockedHintsSet.contains("caseId=" + premiumCase.getId() + ",questionId=" + caseQuestion.getId() + ",hint=1");
                    boolean isH2Unlocked = unlockedHintsSet.contains("caseId=" + premiumCase.getId() + ",questionId=" + caseQuestion.getId() + ",hint=2");
                    boolean isH3Unlocked = unlockedHintsSet.contains("caseId=" + premiumCase.getId() + ",questionId=" + caseQuestion.getId() + ",hint=3");

                    return CaseQuestionDTO.builder()
                            .id(caseQuestion.getId())
                            .orderIndex(caseQuestion.getOrderIndex())
                            .questionVi(caseQuestion.getQuestionVi())
                            .questionEn(caseQuestion.getQuestionEn())
                            .hint1(isH1Unlocked ? caseQuestion.getHint1() : null)
                            .hint2(isH2Unlocked ? caseQuestion.getHint2() : null)
                            .hint3(isH3Unlocked ? caseQuestion.getHint3() : null)
                            .hasHint1(hasH1)
                            .hasHint2(hasH2)
                            .hasHint3(hasH3)
                            .skillTags(caseQuestion.getSkillTags())
                            .build();
                }
        ).toList();
        return PremiumCaseDTO.builder()
                .id(premiumCase.getId())
                .title(premiumCase.getTitle())
                .description(premiumCase.getDescription())
                .difficulty(premiumCase.getDifficulty())
                .hint(premiumCase.getHint())
                .orderIndex(premiumCase.getOrderIndex())
                .baseScore(premiumCase.getBaseScore())
                .badgeName(premiumCase.getBadgeName())
                .badgeIcon(premiumCase.getBadgeIcon())
                .questionCount(premiumCase.getQuestionCount())
                .isUnlocked(customUserDetail.getIsPurchased())
                .caseQuestionDTOList(list)
                .build();
    }

    @Transactional
    public UnlockHintResponse unlockHint(UnlockHintRequest request) {
        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        if (Boolean.FALSE.equals(customUserDetail.getIsPurchased())) {
            throw new SubscriptionNotPurchasedException("Subcription is not purchased");
        }

        User user = userRepository.findById(customUserDetail.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        CaseQuestion caseQuestion = caseQuestionRepository.findById(request.questionId())
                .orElseThrow(() -> new CaseQuestionNotFoundException("Question not found"));

        String hintText = switch (request.hintNumber()) {
            case 1 -> caseQuestion.getHint1();
            case 2 -> caseQuestion.getHint2();
            case 3 -> caseQuestion.getHint3();
            default -> throw new BadRequestException("Invalid hint number: " + request.hintNumber());
        };

        if (hintText == null || hintText.isBlank()) {
            throw new BadRequestException("Hint " + request.hintNumber() + " is not available for this question");
        }

        UserCaseProgress progress = userCaseProgressRepository
                .findByUserIdAndCaseQuestionId(user.getId(), caseQuestion.getId())
                .orElseGet(() -> UserCaseProgress.builder()
                        .user(user)
                        .premiumCase(caseQuestion.getPremiumCase())
                        .caseQuestion(caseQuestion)
                        .status("IN_PROGRESS")
                        .hintsUsed(0)
                        .attempts(0)
                        .scoreEarned(0)
                        .build());

        String hintMeta = "caseId=" + request.caseId() + ",questionId=" + request.questionId() + ",hint=" + request.hintNumber();
        boolean alreadyLogged = userEventRepository
                .existsByUserIdAndUserEventTypeAndMetadata(user.getId(), UserEventType.HINT_USED, hintMeta);

        if (!alreadyLogged) {
            userEventService.logEvent(user, UserEventType.HINT_USED, hintMeta);
            int currentHints = progress.getHintsUsed() != null ? progress.getHintsUsed() : 0;
            progress.setHintsUsed(currentHints + 1);
            userCaseProgressRepository.save(progress);
        }

        return new UnlockHintResponse(request.hintNumber(), hintText, progress.getHintsUsed());
    }

    @PreAuthorize("principal.isPurchased == true")
    public SQLQueryResponse runQuery(SQLQueryRequest sqlQueryRequest) {
        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        User user = userRepository.findById(customUserDetail.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (sqlQueryRequest.questionId() != null) {
            CaseQuestion caseQuestion = caseQuestionRepository.findById(sqlQueryRequest.questionId()).orElse(null);
            if (caseQuestion != null) {
                UserCaseProgress progress = userCaseProgressRepository
                        .findByUserIdAndCaseQuestionId(user.getId(), caseQuestion.getId())
                        .orElseGet(() -> UserCaseProgress.builder()
                                .user(user)
                                .premiumCase(caseQuestion.getPremiumCase())
                                .caseQuestion(caseQuestion)
                                .status("IN_PROGRESS")
                                .hintsUsed(0)
                                .attempts(0)
                                .scoreEarned(0)
                                .build());

                if (!"COMPLETED".equalsIgnoreCase(progress.getStatus())) {
                    int attempts = progress.getAttempts() != null ? progress.getAttempts() : 0;
                    progress.setAttempts(attempts + 1);
                    userCaseProgressRepository.save(progress);
                }
            }
            String meta = "caseId=" + sqlQueryRequest.caseId() + ",questionId=" + sqlQueryRequest.questionId();
            userEventService.logEvent(user, UserEventType.SQL_EXECUTED, meta);
        } else {
            userEventService.logEvent(user, UserEventType.SQL_EXECUTED, "caseId=" + sqlQueryRequest.caseId());
        }

        String normalizedSql = sqlQueryRequest.query().trim().toLowerCase().replaceAll("\\s+", " ");
        String queryHash = DigestUtils.md5DigestAsHex(normalizedSql.getBytes(StandardCharsets.UTF_8));
        String cacheKey = "sandbox:case_" + sqlQueryRequest.caseId() + ":" + queryHash;
        SQLQueryResponse cachedResponse = (SQLQueryResponse) redisTemplate.opsForValue().get(cacheKey);
        if (cachedResponse != null) {
            return cachedResponse; // Cache Hit: Trả kết quả ngay, không cần kết nối MySQL!
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
                        SQLQueryResponse response = new SQLQueryResponse(rows);
                        // 5. Lưu vào Redis với TTL 30 phút
                        redisTemplate.opsForValue().set(cacheKey, response, Duration.ofMinutes(30));
                        return response;
                    }
                }
            } finally {
                conn.setReadOnly(false);
                if (originalCatalog != null && !originalCatalog.isBlank()) {
                    conn.setCatalog(originalCatalog);
                }
            }
        } catch (SQLException e) {
            throw new BadRequestException("SQL Execution Error: " + e.getMessage());
        }

    }

    @Transactional
    public EndCaseResponse endCase(EndCaseRequest endCaseRequest) {
        CaseQuestion caseQuestion = caseQuestionRepository
                .findById(endCaseRequest.questionId())
                .orElseThrow(() -> new CaseQuestionNotFoundException("Question not found"));

        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();
        User user = userRepository.findById(customUserDetail.getUserId())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        boolean alreadyDone = userCaseProgressRepository
                .existsByUserIdAndCaseQuestionIdAndStatus(user.getId(), caseQuestion.getId(), "COMPLETED");
        if (alreadyDone) {
            return new EndCaseResponse("Already completed", true, 0);
        }

        UserCaseProgress progress = userCaseProgressRepository
                .findByUserIdAndCaseQuestionId(user.getId(), caseQuestion.getId())
                .orElseGet(() -> UserCaseProgress.builder()
                        .user(user)
                        .premiumCase(caseQuestion.getPremiumCase())
                        .caseQuestion(caseQuestion)
                        .status("IN_PROGRESS")
                        .hintsUsed(0)
                        .attempts(0)
                        .scoreEarned(0)
                        .build());

        boolean isCorrect = endCaseRequest.answer() != null
                && endCaseRequest.answer().trim().equalsIgnoreCase(caseQuestion.getExpectedOutput().trim());

        if (!isCorrect) {
            int currentAttempts = progress.getAttempts() != null ? progress.getAttempts() : 0;
            progress.setAttempts(currentAttempts + 1);
            userCaseProgressRepository.save(progress);

            String failMeta = "caseId=" + endCaseRequest.caseId() + ",questionId=" + endCaseRequest.questionId();
            userEventService.logEvent(user, UserEventType.ANSWER_FAILED, failMeta);

            return new EndCaseResponse("Submitted evidence is incorrect! Inspect your query results again.", false, 0);
        }

        PremiumCase premiumCase = caseQuestion.getPremiumCase();
        int base = premiumCase.getBaseScore() != null ? premiumCase.getBaseScore() : 100;

        int serverHints = progress.getHintsUsed() != null ? progress.getHintsUsed() : 0;
        int serverAttempts = progress.getAttempts() != null && progress.getAttempts() > 0 ? progress.getAttempts() : 1;

        int hintPenalty = serverHints * (base / 5);
        int attemptPenalty = Math.max(0, serverAttempts - 1) * (base / 10);
        int scoreEarned = Math.max(0, base - hintPenalty - attemptPenalty);

        progress.setStatus("COMPLETED");
        progress.setScoreEarned(scoreEarned);
        progress.setHintsUsed(serverHints);
        progress.setAttempts(serverAttempts);
        progress.setCompletedAt(LocalDateTime.now());
        userCaseProgressRepository.save(progress);

        user.setTotalScore(user.getTotalScore() + scoreEarned);

        long completedCount = userCaseProgressRepository
                .countByUserIdAndPremiumCaseIdAndStatus(user.getId(), premiumCase.getId(), "COMPLETED");
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

        String successMeta = "caseId=" + endCaseRequest.caseId() + ",questionId=" + endCaseRequest.questionId() + ",score=" + scoreEarned;
        userEventService.logEvent(user, UserEventType.CASE_COMPLETED, successMeta);

        return new EndCaseResponse("Correct!", true, scoreEarned);
    }

    @PreAuthorize("principal.isPurchased == true")
    @Cacheable(cacheNames = "premiumCases:tables", key = "#id")
    public GetTableResponse getTables(Long id) {
        if (!premiumCaseRepository.existsById(id)) {
            throw new PremiumCaseNotFoundException("Premium Case not found");
        }

        CustomUserDetail customUserDetail = SecurityUtil.getCurrentUser();

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
