package com.example.be.service;

import com.example.be.annotationImp.IdempotencyRecord;
import com.example.be.enums.Status;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;

@Service
public class IdempotencyService {
    private final ConcurrentHashMap<String, IdempotencyRecord> lockMap = new ConcurrentHashMap<>();

    public record LockResult(boolean isAllowed, Object cachedResponse) {}

    public LockResult checkAndLock(String key, long timeoutProcessing) {
        long now = System.currentTimeMillis();
        long newExpireTime = now + timeoutProcessing * 1000;
        boolean[] isNew = new boolean[]{false};

        IdempotencyRecord result = lockMap.compute(key, (k, record) -> {
            if (record != null && record.getExpireAt() > now) {
                return record;
            } else {
                isNew[0] = true;
                return new IdempotencyRecord(Status.PROCESSING, null, newExpireTime);
            }
        });

        if (isNew[0]) {
            return new LockResult(true, null);
        }

        if (result.getStatus() == Status.COMPLETED && result.getExpireAt() > now) {
            return new LockResult(false, result.getResponse());
        }

        return new LockResult(false, null);
    }

    public void complete(String key, Object response, long timeoutCompleted) {
        long expireTime = System.currentTimeMillis() + timeoutCompleted * 1000;
        lockMap.computeIfPresent(key, (k, record) -> new IdempotencyRecord(Status.COMPLETED, response, expireTime));
    }

    public void remove(String key) {
        lockMap.remove(key);
    }

    @Scheduled(fixedRate = 60000)
    public void cleanExpiredRecords() {
        long now = System.currentTimeMillis();
        lockMap.entrySet().removeIf(entry -> entry.getValue().getExpireAt() <= now);
    }
}

