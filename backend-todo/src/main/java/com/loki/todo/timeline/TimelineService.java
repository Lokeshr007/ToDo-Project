package com.loki.todo.timeline;

import com.loki.todo.model.User;
import com.loki.todo.model.Workspace;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class TimelineService {

    @Autowired
    private TimelineEventRepository repo;

    public void record(
            Workspace workspace,
            User actor,
            String type,
            String description,
            Long entityId){

        TimelineEvent event = new TimelineEvent();

        event.setWorkspace(workspace);
        event.setActor(actor);
        event.setEventType(type);
        event.setDescription(description);
        event.setEntityId(entityId);
        event.setCreatedAt(LocalDateTime.now());

        repo.save(event);
    }
}
