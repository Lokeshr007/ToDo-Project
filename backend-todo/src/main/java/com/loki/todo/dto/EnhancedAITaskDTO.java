// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\dto\EnhancedAITaskDTO.java
package com.loki.todo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
public class EnhancedAITaskDTO {
    private Long id;
    private Integer dayNumber;
    private Integer weekNumber;
    private String title;
    private String assignedToId;
    private String description;
    private String priority;
    private Double estimatedHours;
    private String status;
    private String category;
    private String subCategory;
    private List<String> tags;
    private List<String> prerequisites;
    private String resourceLinks;
    private String deliverables;
    private Long parentTaskId;
    private Integer orderIndex;
    private Boolean accepted;
    private LocalDate suggestedStartDate;
    private LocalDate suggestedDueDate;
}