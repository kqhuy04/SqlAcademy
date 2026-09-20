package com.example.be.repository;

import com.example.be.entity.UserEvent;
import com.example.be.enums.UserEventType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface UserEventRepository extends JpaRepository<UserEvent, Long> {

    List<UserEvent> findByUserId(Long id);

    List<UserEvent> findByUserEventType(UserEventType userEventType);

    List<UserEvent> findByCreatedAtGreaterThan(LocalDateTime createAt);

    boolean existsByUserIdAndUserEventTypeAndMetadata(Long userId, UserEventType userEventType, String metadata);

    @Modifying
    @Query("DELETE FROM UserEvent u where u.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);

}