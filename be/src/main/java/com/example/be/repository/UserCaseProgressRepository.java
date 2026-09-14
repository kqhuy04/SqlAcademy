package com.example.be.repository;

import com.example.be.entity.UserCaseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserCaseProgressRepository extends JpaRepository<UserCaseProgress, Long> {
}
