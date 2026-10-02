package com.example.be.repository;

import com.example.be.dto.LeaderboardProjection;
import com.example.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsById(Long id);

    List<User> findByPremiumPurchasedAtIsNotNull();

    List<User> findAllByOrderByTotalScoreDesc();


    @Modifying
    @Query("UPDATE User u SET u.totalScore = u.totalScore + :score WHERE u.id = :userId")
    void incrementTotalScore(@Param("userId") Long userId, @Param("score") int score);

    @Query(value = """
    SELECT top_u.username AS username,
           top_u.total_score AS totalScore,
           COUNT(DISTINCT CASE WHEN p.status = 'COMPLETED' THEN p.case_id END) AS casesCompleted
    FROM (
        SELECT id, username, total_score
        FROM users
        ORDER BY total_score DESC
        LIMIT :limit
    ) top_u
    LEFT JOIN user_case_progress p ON top_u.id = p.user_id
    GROUP BY top_u.id, top_u.username, top_u.total_score
    ORDER BY top_u.total_score DESC;
    """, nativeQuery = true)
    List<LeaderboardProjection> getTopLeaderboard(@Param("limit") int limit);
}
