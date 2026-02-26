package com.loki.todo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserStatsDTO {
    private Long tasksCompleted;
    private Long projectsCreated;
    private Long daysActive;
    private Long currentStreak;
    private Long totalTasks;
    private Long pendingTasks;
    private Long overdueTasks;
    private Double completionRate;
    private Long totalProjects;
    private Long totalBoards;
    private Long totalTimeSpent;
    private Long averageTasksPerDay;
    private String bestProductiveDay;
    private Long focusTime;
    private Long productivityScore;
}