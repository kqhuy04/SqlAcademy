package com.example.be.repository;

import com.example.be.entity.UserEvent;
import com.example.be.enums.UserEventType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserEventRepository extends JpaRepository<UserEvent, Long> {

    List<UserEvent> findByUserId(Long id);
    List<UserEvent> findByUserEventType(UserEventType userEventType);

    List<UserEvent> findByCreatedAtGreaterThan(LocalDateTime createAt);

}