package com.example.be.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "case_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CaseQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "case_id", nullable = false)
    private PremiumCase premiumCase;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(name = "question_vi", columnDefinition = "TEXT")
    private String questionVi;

    @Column(name = "question_en", columnDefinition = "TEXT")
    private String questionEn;

    @Column(name = "hint_1", columnDefinition = "TEXT")
    private String hint1;

    @Column(name = "hint_2", columnDefinition = "TEXT")
    private String hint2;

    @Column(name = "hint_3", columnDefinition = "TEXT")
    private String hint3;

    @Column(name = "skill_tags")
    private String skillTags;
}