package com.loki.todo.dto;

import com.loki.todo.model.Todos;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@NoArgsConstructor
public class TodoRequest {
    private String item;
    private String title; // Alias for item
    private String description;
    private String priority;
    private String status;
    private LocalDate dueDate;
    private String dueTime;
    private LocalDateTime dueDateTime;
    private Long assignedToId;  // Single primary assignee
    private java.util.List<Long> assigneeIds; // Multiple assignees
    private Long projectId;
    private Long boardId;
    private Long columnId;
    private Long goalId;
    private Integer storyPoints;
    private String[] labels;

    // Add getter for assignedUserId to maintain compatibility
    public Long getAssignedUserId() {
        return assignedToId;
    }

    // Add setter for assignedUserId
    public void setAssignedUserId(Long assignedUserId) {
        this.assignedToId = assignedUserId;
    }

    public String getItem() {
        return item != null ? item : title;
    }

    public void setItem(String item) {
        this.item = item;
        this.title = item;
    }

    public void setTitle(String title) {
        this.title = title;
        this.item = title;
    }

    public Todos.Priority getPriorityEnum() {
        if (priority == null) return Todos.Priority.NORMAL;
        try {
            return Todos.Priority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Todos.Priority.NORMAL;
        }
    }

    public Todos.Status getStatusEnum() {
        if (status == null) return Todos.Status.PENDING;
        try {
            return Todos.Status.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return Todos.Status.PENDING;
        }
    }

    // Process due date and time into dueDateTime
    public LocalDateTime getProcessedDueDateTime() {
        if (dueDateTime != null) {
            return dueDateTime;
        }

        if (dueDate != null) {
            if (dueTime != null && !dueTime.isEmpty()) {
                try {
                    LocalTime time = LocalTime.parse(dueTime);
                    return LocalDateTime.of(dueDate, time);
                } catch (Exception e) {
                    // If time parsing fails, use end of day
                    return dueDate.atTime(23, 59, 59);
                }
            } else {
                // No time provided, use end of day
                return dueDate.atTime(23, 59, 59);
            }
        }

        return null;
    }
}