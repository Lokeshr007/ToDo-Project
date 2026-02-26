package com.loki.todo.service;

import com.loki.todo.model.DomainEvent;
import com.loki.todo.model.Todos;
import com.loki.todo.repository.DomainEventRepository;
import com.loki.todo.repository.TodosRepository;
import com.loki.todo.workflow.WorkflowEngine;
import com.loki.todo.workflow.WorkflowEvent;
import com.loki.todo.workflow.WorkflowEventType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DomainEventProcessor {

    @Autowired
    private DomainEventRepository repo;

    @Autowired
    private WorkflowEngine workflowEngine;

    @Autowired
    private TodosRepository todoRepo;

    @Scheduled(fixedDelay = 5000)
    public void processEvents() {
        List<DomainEvent> events = repo.findByProcessedFalse();

        for (DomainEvent event : events) {
            try {
                WorkflowEvent workflowEvent = convert(event);
                workflowEngine.handleWorkflow(workflowEvent);  // This now matches

                event.setProcessed(true);
                repo.save(event);
            } catch (Exception e) {
                // Log error but don't stop processing other events
                System.err.println("Error processing event: " + e.getMessage());
            }
        }
    }

    private WorkflowEvent convert(DomainEvent event) {
        WorkflowEventType type = WorkflowEventType.valueOf(event.getEventType());

        Long todoId = Long.parseLong(event.getPayload());

        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        return new WorkflowEvent(type, todo);
    }
}