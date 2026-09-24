package com.example.be.repository;

import com.example.be.entity.Order;
import com.example.be.entity.PremiumCase;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PremiumCaseRepository extends JpaRepository<PremiumCase, Long> {
    Optional<PremiumCase> findById(Long id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT o FROM Order o WHERE o.orderCode = :orderCode")
    Optional<Order> findByOrderCodeWithLock(@Param("orderCode") Long orderCode);
}
