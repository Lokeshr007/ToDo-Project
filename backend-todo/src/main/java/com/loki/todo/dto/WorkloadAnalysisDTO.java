package com.loki.todo.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class WorkloadAnalysisDTO {
    private List<UserWorkload> userWorkloads;
    private List<Bottleneck> bottlenecks;
    private List<Suggestion> suggestions;
    private Map<String, Long> tasksByStatus;
    private double overallEfficiency;

    @Data
    @Builder
    public static class UserWorkload {
        private Long userId;
        private String userName;
        private int activeTasks;
        private int completedTasks;
        private int overdueTasks;
        private double utilizationPercentage; // based on 40h week or custom capacity
    }

    @Data
    @Builder
    public static class Bottleneck {
        private String reason;
        private String severity; // HIGH, MEDIUM, LOW
        private List<Long> affectedTaskIds;
    }

    @Data
    @Builder
    public static class Suggestion {
        private String type; // REASSIGN, REPRIORITIZE, DEADLINE_SHIFT
        private String description;
        private Long targetTaskId;
        private String recommendedAssignee;
    }
}
