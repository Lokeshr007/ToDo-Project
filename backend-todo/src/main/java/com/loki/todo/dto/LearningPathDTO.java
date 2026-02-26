package com.loki.todo.dto;

import lombok.Data;
import java.util.List;

@Data
public class LearningPathDTO {
    private String title;
    private String description;
    private String category;
    private String difficulty;
    private Integer totalDays;
    private Double totalHours;
    private String learningObjectives;
    private String prerequisites;
    private List<LearningPathMilestoneDTO> milestones;
}

