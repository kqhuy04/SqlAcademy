package com.example.be.repository;

import com.example.be.dto.LeaderboardProjection;
import com.example.be.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
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


    @Query(value = """
    SELECT u.username AS username, 
           u.total_score AS totalScore,
           COUNT(DISTINCT CASE WHEN p.status = 'COMPLETED' THEN p.case_id END) AS casesCompleted
    FROM users u
    LEFT JOIN user_case_progress p ON u.id = p.user_id
    GROUP BY u.id, u.username, u.total_score
    ORDER BY u.total_score DESC
    LIMIT :limit
    """, nativeQuery = true)
    List<LeaderboardProjection> getTopLeaderboard(@Param("limit") int limit);
}
