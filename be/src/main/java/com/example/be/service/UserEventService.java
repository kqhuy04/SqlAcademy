package com.example.be.service;

import com.example.be.entity.User;
import com.example.be.entity.UserEvent;
import com.example.be.enums.UserEventType;
import com.example.be.repository.UserEventRepository;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class UserEventService {

    private final UserEventRepository userEventRepository;

    UserEventService(UserEventRepository userEventRepository) {
        this.userEventRepository = userEventRepository;
    }

    @Async
    public void logEvent(User user, UserEventType userEventType, String metadata) {
        Long caseId = extractLongParam(metadata, "caseId=");
        Long questionId = extractLongParam(metadata, "questionId=");
        logEvent(user, userEventType, caseId, questionId, metadata);
    }

    @Async
    public void logEvent(User user, UserEventType userEventType, Long caseId, Long questionId, String metadata) {
        UserEvent userEvent = UserEvent.builder()
                .user(user)
                .userEventType(userEventType)
                .caseId(caseId)
                .questionId(questionId)
                .metadata(metadata)
                .build();
        userEventRepository.save(userEvent);
    }

    private Long extractLongParam(String metadata, String key) {
        if (metadata == null || !metadata.contains(key)) {
            return null;
        }
        try {
            int start = metadata.indexOf(key) + key.length();
            int end = metadata.indexOf(',', start);
            String value = end == -1 ? metadata.substring(start) : metadata.substring(start, end);
            return Long.parseLong(value.trim());
        } catch (Exception e) {
            return null;
        }
    }
}
