package com.example.be.service;

import com.example.be.entity.User;
import com.example.be.entity.UserEvent;
import com.example.be.enums.UserEventType;
import com.example.be.repository.UserEventRepository;
import org.springframework.stereotype.Service;

@Service
public class UserEventService {

    private final UserEventRepository userEventRepository;

    UserEventService(UserEventRepository userEventRepository) {
        this.userEventRepository = userEventRepository;
    }

    public void logEvent(User user, UserEventType userEventType, String metadata) {
        UserEvent userEvent = UserEvent.builder()
                .user(user)
                .userEventType(userEventType)
                .metadata(metadata)
                .build();
        userEventRepository.save(userEvent);
    }
}
