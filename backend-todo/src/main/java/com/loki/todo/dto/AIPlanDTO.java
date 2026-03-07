package com.loki.todo.dto;

import lombok.Data;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class AIPlanDTO {
    private Long id;
    private String title;
    private Integer duration;
    private List<String> subjects;
    private List<AIPlanDailyGoalDTO> dailyGoals;
    private List<AIPlanMilestoneDTO> milestones;
    private Integer recommendedHoursPerDay;
    private List<String> prerequisites;
}