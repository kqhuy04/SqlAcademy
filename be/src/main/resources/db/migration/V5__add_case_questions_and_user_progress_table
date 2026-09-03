CREATE TABLE `case_questions` (
  `id`          bigint NOT NULL AUTO_INCREMENT,
  `case_id`     bigint NOT NULL,
  `order_index` int    NOT NULL,
  `question_vi` text,
  `question_en` text,
  `hint_1`      text,
  `hint_2`      text,
  `hint_3`      text,
  `skill_tags`  varchar(255),
  PRIMARY KEY (`id`),
  KEY `fk_cq_case` (`case_id`),
  CONSTRAINT `fk_cq_case`
    FOREIGN KEY (`case_id`) REFERENCES `premium_cases` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `user_case_progress` (
  `id`           bigint NOT NULL AUTO_INCREMENT,
  `user_id`      bigint NOT NULL,
  `case_id`      bigint NOT NULL,
  `question_id`  bigint NOT NULL,
  `status`       varchar(20) NOT NULL DEFAULT 'NOT_STARTED',
  `score_earned` int         NOT NULL DEFAULT 0,
  `hints_used`   int         NOT NULL DEFAULT 0,
  `attempts`     int         NOT NULL DEFAULT 0,
  `completed_at` datetime(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_user_question` (`user_id`, `question_id`),
  KEY `fk_ucp_case`     (`case_id`),
  KEY `fk_ucp_question` (`question_id`),
  CONSTRAINT `fk_ucp_user`
    FOREIGN KEY (`user_id`)     REFERENCES `users` (`id`),
  CONSTRAINT `fk_ucp_case`
    FOREIGN KEY (`case_id`)     REFERENCES `premium_cases` (`id`),
  CONSTRAINT `fk_ucp_question`
    FOREIGN KEY (`question_id`) REFERENCES `case_questions` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;