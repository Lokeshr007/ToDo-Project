package com.loki.todo.service;

import com.loki.todo.model.DomainEvent;
import com.loki.todo.repository.DomainEventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DomainEventService {

    @Autowired
    private DomainEventRepository repo;

    public void saveEvent(String type, String payload){

        DomainEvent event = new DomainEvent();

        event.setEventType(type);
        event.setPayload(payload);
        event.setProcessed(false);
        event.setCreatedAt(LocalDateTime.now());

        repo.save(event);
    }
}