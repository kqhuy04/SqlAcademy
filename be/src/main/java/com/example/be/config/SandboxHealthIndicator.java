package com.example.be.config;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.health.contributor.Health;
import org.springframework.boot.health.contributor.HealthIndicator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.Statement;

@Component
public class SandboxHealthIndicator implements HealthIndicator {

    private final DataSource sandboxDataSource;

    public SandboxHealthIndicator(@Qualifier("sandboxDataSource") DataSource sandboxDataSource) {
        this.sandboxDataSource = sandboxDataSource;
    }

    @Override
    public Health health() {
        try (Connection conn = sandboxDataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("SELECT 1");
            return Health.up().withDetail("sandbox_db", "Accessible").build();
        } catch (Exception e) {
            return Health.down().withDetail("sandbox_db", "Down: " + e.getMessage()).build();
        }
    }
}