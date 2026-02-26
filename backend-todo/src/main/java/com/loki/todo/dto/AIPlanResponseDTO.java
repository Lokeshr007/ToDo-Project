// BACKEND-TODO/SRC/main/java/com/loki/todo/dto/AIPlanResponseDTO.java
package com.loki.todo.dto;

import lombok.Data;
import java.util.List;

@Data
public class AIPlanResponseDTO {
    private Long id;
    private String title;
    private Integer duration;
    private List<String> subjects;
    private List<AIPlanDailyGoalDTO> dailyGoals;
    private List<AIPlanMilestoneDTO> milestones;
    private Integer recommendedHoursPerDay;
    private List<String> prerequisites;
}