package com.example.be.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class SandboxDataSourceConfig {

    @Value("${sandbox.datasource.url:jdbc:mysql://localhost:3306}")
    private String url;
    @Value("${sandbox.datasource.username:student_sandbox}")
    private String username;
    @Value("${sandbox.datasource.password:SafeSandboxPass2026!}")
    private String password;
    @Value("${sandbox.datasource.hikari.maximum-pool-size:5}")
    private int maxPoolSize;

    @Bean(name = "sandboxDataSource")
    public DataSource sandboxDataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(url);
        dataSource.setUsername(username);
        dataSource.setPassword(password);
        dataSource.setMaximumPoolSize(maxPoolSize);
        dataSource.setPoolName("Sandbox-HikariPool");
        return dataSource;
    }
}
