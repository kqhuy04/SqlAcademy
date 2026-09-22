package com.example.be.service;

import com.example.be.annotationImp.IdempotencyRecord;
import com.example.be.enums.Status;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class IdempotencyService {
    private final ConcurrentHashMap<String, IdempotencyRecord> lockMap = new ConcurrentHashMap<>();
    private final RedisTemplate<String, Object> redisTemplate;

    IdempotencyService(RedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public boolean checkAndLock(String key, long timeoutProcessing) {
        Boolean isNew = redisTemplate.opsForValue().setIfAbsent(key, "PROCESSING",
                Duration.ofSeconds(timeoutProcessing)
                );
        if (Boolean.TRUE.equals(isNew)) {
            return true;
        }
        return false;
    }

    public void remove(String key) {
        redisTemplate.delete(key);
    }

}

