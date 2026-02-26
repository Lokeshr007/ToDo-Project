// BACKEND-TODO/SRC/main/java/com/loki/todo/dto/AIPlanDTO.java
package com.loki.todo.dto;

import lombok.Data;
import java.util.List;

@Data
public class AIPlanDTO {
    private Long id;
    private String title;
    private Integer duration;
    private List<String> subjects;
    private List<AIPlanDailyGoalDTO> dailyGoals;
    private List<AIPlanMilestoneDTO> milestones;
}