package com.example.be.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class IdempotencyService {

    private final RedisTemplate<String, Object> redisTemplate;

    public IdempotencyService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean checkAndLock(String key, long timeoutProcessing) {
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(key, "PROCESSING",
                Duration.ofSeconds(timeoutProcessing)
                );
        return Boolean.TRUE.equals(isNew);
    }

    public void remove(String key) {
        redisTemplate.delete(key);
    }

}

