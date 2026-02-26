package com.loki.todo.workflow;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class WorkflowEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    public WorkflowEventPublisher(ApplicationEventPublisher applicationEventPublisher) {
        this.applicationEventPublisher = applicationEventPublisher;
    }

    public void publish(final WorkflowEvent event) {
        log.info("Publishing workflow event: {}", event.getType());
        applicationEventPublisher.publishEvent(event);
    }
}