package com.loki.todo.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class GoalDTO {
    private Long id;
    private String title;
    private String description;
    private String type;
    private Integer target;
    private String unit;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer progress;
    private List<LocalDate> completedDates;
    private List<Long> linkedTasks;
    private String priority;
    private String color;
    private Boolean reminder;
    private String reminderTime;
    private Long userId;
    private Long workspaceId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}