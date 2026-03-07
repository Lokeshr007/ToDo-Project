package com.loki.todo.workflow;

import com.loki.todo.model.BoardActivity;
import com.loki.todo.model.Todos;
import com.loki.todo.model.User;
import com.loki.todo.repository.BoardActivityRepository;
import com.loki.todo.repository.TodosRepository;
import com.loki.todo.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
public class WorkflowEngine {

    private final TodosRepository todoRepo;
    private final BoardActivityRepository activityRepo;
    private final NotificationService notificationService;
    private final RealtimeNotificationService realtimeService;

    public WorkflowEngine(
            TodosRepository todoRepo,
            BoardActivityRepository activityRepo,
            NotificationService notificationService,
            RealtimeNotificationService realtimeService) {
        this.todoRepo = todoRepo;
        this.activityRepo = activityRepo;
        this.notificationService = notificationService;
        this.realtimeService = realtimeService;
    }

    @Async
    @EventListener
    @Transactional
    public void handleWorkflow(WorkflowEvent event) {  // Changed from handleWorkflowEvent to handleWorkflow
        log.info("Processing workflow event: {}", event.getType());

        switch (event.getType()) {
            case TODO_CREATED:
                handleTodoCreated(event);
                break;
            case TODO_COMPLETED:
                handleTodoCompleted(event);
                break;
            case TODO_ASSIGNED:
                handleTodoAssigned(event);
                break;
            case TODO_DUE_DATE_CHANGED:
                handleDueDateChanged(event);
                break;
            case TODO_MOVED_COLUMN:
                handleTaskMoved(event);
                break;
            default:
                log.debug("No specific handler for event type: {}", event.getType());
        }
    }

    private void handleTodoCreated(WorkflowEvent event) {
        Todos todo = (Todos) event.getSource();
        log.info("Task created: {}", todo.getItem());

        if (todo.getAssignees() != null) {
            for (User assignee : todo.getAssignees()) {
                if (todo.getCreatedBy() != null && !assignee.getId().equals(todo.getCreatedBy().getId())) {
                    notificationService.sendTaskAssignedNotification(todo, assignee);
                }
            }
        }
    }

    private void handleTodoCompleted(WorkflowEvent event) {
        Todos todo = (Todos) event.getSource();
        log.info("Task completed: {}", todo.getItem());

        notificationService.sendTaskCompletedNotification(todo);
    }

    private void handleTodoAssigned(WorkflowEvent event) {
        Todos todo = (Todos) event.getSource();
        User newlyAssigned = (User) event.getNewValue();

        log.info("Task assigned: {} to {}", todo.getItem(),
                newlyAssigned != null ? newlyAssigned.getName() :
                (todo.getAssignedTo() != null ? todo.getAssignedTo().getName() : "nobody"));

        if (newlyAssigned != null) {
            notificationService.sendTaskAssignedNotification(todo, newlyAssigned);
        } else if (todo.getAssignedTo() != null) {
            notificationService.sendTaskAssignedNotification(todo, todo.getAssignedTo());
        }
    }

    private void handleDueDateChanged(WorkflowEvent event) {
        Todos todo = (Todos) event.getSource();
        log.info("Due date changed for task: {}", todo.getItem());
    }

    private void handleTaskMoved(WorkflowEvent event) {
        Todos todo = (Todos) event.getSource();
        log.info("Task moved: {}", todo.getItem());

        // Broadcast move to all project members over WebSocket
        if (todo.getProject() != null) {
            realtimeService.sendProjectUpdate(
                    todo.getProject().getId(),
                    "TASK_MOVED",
                    todo.getId()
            );
        }
    }
}