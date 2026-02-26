package com.loki.todo.dto;

import lombok.Data;
import java.util.List;

@Data
public class GoalProgressDTO {
    private Long goalId;
    private String title;
    private Integer target;
    private Integer current;
    private Integer progress;
    private Integer remaining;
    private List<String> completedDates;
    private String status; // ON_TRACK, BEHIND, COMPLETED, OVERDUE
    private Integer daysRemaining;
    private Double projectedCompletion;
}