package com.loki.todo.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ReminderDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime scheduledFor;
    private Boolean triggered;
    private Boolean completed;
    private LocalDateTime completedAt;
    private Boolean snoozed;
    private Integer snoozeCount;
    private Long todoId;
    private String reminderType;
    private Integer leadTime;
    private List<String> channels;
    private Long userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Additional fields for UI
    private TodoDTO todo; // populated if todoId exists
}