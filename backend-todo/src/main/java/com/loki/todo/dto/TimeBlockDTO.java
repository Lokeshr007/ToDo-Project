package com.loki.todo.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.time.LocalDate;

@Data
public class TimeBlockDTO {
    private Long id;
    private String title;
    private String description;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private LocalDate date;
    private String category;
    private String color;
    private Long todoId;
    private Boolean completed;
    private LocalDateTime completedAt;
    private Boolean recurring;
    private String recurringType;
    private Integer orderIndex;
    private Long userId;
    private Long workspaceId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}