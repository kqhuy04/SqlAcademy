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

    private static final String VIEW_BUFFER_PREFIX = "post:view:buffer:";
    private static final String DIRTY_POST_SET = "post:view:dirty_ids";

    public PostViewSyncService(RedisTemplate<String, Object> redisTemplate, JdbcTemplate jdbcTemplate) {
        this.redisTemplate = redisTemplate;
        this.jdbcTemplate = jdbcTemplate;
    }

    // Record nhỏ gọn để lưu cặp (postId, số view cần cộng thêm)
    private record PostViewDelta(Long postId, Long viewsToAdd) {}

    /**
     * 1. Khi người dùng đọc bài: Tăng bộ đệm trên Redis siêu tốc (< 1ms), không chạm vào MySQL.
     */
    public void recordView(Long postId) {
        redisTemplate.opsForValue().increment(VIEW_BUFFER_PREFIX + postId);
        redisTemplate.opsForSet().add(DIRTY_POST_SET, postId.toString());
    }

    /**
     * 2. Chạy ngầm mỗi 5 phút (300.000 ms):
     *    Gom toàn bộ các bài viết có view mới và thực hiện 1 CÂU BATCH UPDATE DUY NHẤT xuống MySQL.
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void syncViewsToDatabase() {
        Set<Object> dirtyIds = redisTemplate.opsForSet().members(DIRTY_POST_SET);
        if (dirtyIds == null || dirtyIds.isEmpty()) {
            return;
        }

        List<PostViewDelta> deltas = new ArrayList<>();

        for (Object objId : dirtyIds) {
            String postIdStr = (String) objId;
            Long postId = Long.valueOf(postIdStr);
            String bufferKey = VIEW_BUFFER_PREFIX + postId;

            // getAndDelete: Lấy số view ra và xóa key ngay trên Redis để giải phóng RAM
            Object viewsObj = redisTemplate.opsForValue().getAndDelete(bufferKey);
            if (viewsObj != null) {
                long viewsToAdd = Long.parseLong(viewsObj.toString());
                if (viewsToAdd > 0) {
                    deltas.add(new PostViewDelta(postId, viewsToAdd));
                }
            }
        }

        // BẮN BATCH UPDATE 1 PHÁT DUY NHẤT
        if (!deltas.isEmpty()) {
            String sql = "UPDATE posts SET view_count = view_count + ? WHERE id = ?";

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

            log.info("Batch updated view counts for {} posts to MySQL successfully.", deltas.size());
        }

        // Xóa tập hợp dirty IDs sau khi đã đồng bộ xong
        redisTemplate.delete(DIRTY_POST_SET);
    }
}