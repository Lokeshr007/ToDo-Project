// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\dto\EnhancedAIPlanDTO.java
package com.loki.todo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
public class EnhancedAIPlanDTO {
    private Long id;
    private String title;
    private String description;
    private Integer durationDays;
    private String sourceFileName;
    private String sourceFileType;
    private String summary;
    private String difficulty;
    private String category;
    private Double estimatedTotalHours;
    private Double recommendedDailyHours;
    private Integer confidenceScore;
    private List<String> learningObjectives;
    private List<String> prerequisites;
    private List<String> resources;
    private Map<String, Object> weeklyBreakdown;
    private LocalDateTime createdAt;
}