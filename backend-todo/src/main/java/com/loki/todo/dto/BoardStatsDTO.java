// BoardStatsDTO.java - Fixed
package com.loki.todo.dto;

import lombok.Data;

@Data
public class BoardStatsDTO {
    private Long totalTasks;
    private Long completedTasks;
    private Long overdueTasks;
    private Long inProgressTasks;
    private Long pendingTasks;
    private Long blockedTasks;
    private Double completionRate;
    private Long totalMovements;
    private Long averageCycleTime; // in hours
    private Long averageLeadTime; // in hours
}