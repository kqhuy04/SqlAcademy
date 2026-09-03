package com.example.be.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "premium_cases")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PremiumCase {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "difficulty", nullable = false)
    private String difficulty;

    @Column(name = "hint", nullable = false)
    private String hint;

    @Column(name = "db_path", nullable = false)
    private String dbPath;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "base_score")
    private Integer baseScore;

    @Column(name = "xp_reward")
    private Integer xpReward;

    @Column(name = "bade_name")
    private String badgeName;

    @Column(name = "badge_icon")
    private String badgeIcon;

    @Column(name = "question_count")
    private Integer questionCount;
}
