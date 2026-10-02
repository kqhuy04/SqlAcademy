package com.example.be.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.jdbc.core.BatchPreparedStatementSetter;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
public class PostViewSyncService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final JdbcTemplate jdbcTemplate;

    private static final String VIEW_HASH_KEY = "post:views:buffer";
    private static final String SYNC_HASH_KEY = "post:views:syncing";

    public PostViewSyncService(RedisTemplate<String, Object> redisTemplate, JdbcTemplate jdbcTemplate) {
        this.redisTemplate = redisTemplate;
        this.jdbcTemplate = jdbcTemplate;
    }

    // Record nhỏ gọn để lưu cặp (postId, số view cần cộng thêm)
    private record PostViewDelta(Long postId, Long viewsToAdd) {}

    /**
     * 1. Khi người dùng đọc bài: Tăng bộ đệm trên Redis Hash siêu tốc (< 1ms), không chạm vào MySQL.
     */
    public void recordView(Long postId) {
        redisTemplate.opsForHash().increment(VIEW_HASH_KEY, postId.toString(), 1L);
    }

    /**
     * 2. Chạy ngầm mỗi 5 phút (300.000 ms):
     *    Nguyên tử đổi tên Hash buffer -> syncing, gom batch update vào MySQL mà không mất view nào.
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void syncViewsToDatabase() {
        if (!Boolean.TRUE.equals(redisTemplate.hasKey(VIEW_HASH_KEY))) {
            return;
        }

        // Đổi tên nguyên tử sang key tạm để không bao giờ bị race condition với view mới đang đọc
        try {
            redisTemplate.rename(VIEW_HASH_KEY, SYNC_HASH_KEY);
        } catch (Exception e) {
            log.warn("Rename view hash buffer failed or empty: {}", e.getMessage());
            return;
        }

        java.util.Map<Object, Object> entries = redisTemplate.opsForHash().entries(SYNC_HASH_KEY);
        if (entries == null || entries.isEmpty()) {
            redisTemplate.delete(SYNC_HASH_KEY);
            return;
        }

        List<PostViewDelta> deltas = new ArrayList<>();
        for (java.util.Map.Entry<Object, Object> entry : entries.entrySet()) {
            Long postId = Long.valueOf(entry.getKey().toString());
            long viewsToAdd = Long.parseLong(entry.getValue().toString());
            if (viewsToAdd > 0) {
                deltas.add(new PostViewDelta(postId, viewsToAdd));
            }
        }

        // BẮN BATCH UPDATE 1 PHÁT DUY NHẤT
        if (!deltas.isEmpty()) {
            String sql = "UPDATE posts SET view_count = view_count + ? WHERE id = ?";

            try {
                jdbcTemplate.batchUpdate(sql, new BatchPreparedStatementSetter() {
                    @Override
                    public void setValues(PreparedStatement ps, int i) throws SQLException {
                        PostViewDelta delta = deltas.get(i);
                        ps.setLong(1, delta.viewsToAdd());
                        ps.setLong(2, delta.postId());
                    }

                    @Override
                    public int getBatchSize() {
                        return deltas.size();
                    }
                });

                // Chỉ xóa key trên Redis sau khi MySQL đã commit batch thành công
                redisTemplate.delete(SYNC_HASH_KEY);
                log.info("Batch updated view counts for {} posts to MySQL successfully.", deltas.size());
            } catch (Exception e) {
                log.error("Failed to batch update views to MySQL. Merging back to Redis buffer: {}", e.getMessage());
                // Merge views trở lại buffer chính để chống mất dữ liệu khi DB lỗi
                for (PostViewDelta delta : deltas) {
                    redisTemplate.opsForHash().increment(VIEW_HASH_KEY, delta.postId().toString(), delta.viewsToAdd());
                }
                redisTemplate.delete(SYNC_HASH_KEY);
                throw e;
            }
        } else {
            redisTemplate.delete(SYNC_HASH_KEY);
        }
    }
}