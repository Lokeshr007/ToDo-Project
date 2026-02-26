// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\dto\EnterpriseAIResponseDTO.java
package com.loki.todo.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnterpriseAIResponseDTO {
    private String id;
    private String sessionId;
    private String action;
    private Boolean success;
    private String message;

    private EnhancedAIPlanDTO plan;
    private List<EnhancedAITaskDTO> tasks;
    private AIProjectStructureDTO projectStructure;

    private String summary;
    private Integer confidenceScore;
    private Integer totalTasks;
    private Double totalHours;
    private Integer estimatedDays;

    private Map<String, Object> insights;
    private List<String> suggestions;
    private Map<String, Object> data;
    private Map<String, Object> context;
}