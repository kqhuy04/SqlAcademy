package com.example.be.repository;

import com.example.be.entity.PremiumCase;
import com.example.be.entity.User;
import org.hibernate.boot.jaxb.mapping.spi.JaxbPersistentAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByEmailOrUsername(String email, String username);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    List<User> findByPremiumPurchasedIsNotNull();




}
