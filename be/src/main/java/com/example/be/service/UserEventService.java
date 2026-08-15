package com.example.be.service;

import com.example.be.repository.UserEventRepository;
import com.example.be.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserEventService {

    private final UserEventRepository userEventRepository;

    UserEventService(UserEventRepository userEventRepository) {
        this.userEventRepository = userEventRepository;
    }
}
