// TodoCardDTO.java - Fixed
package com.loki.todo.dto;

import com.loki.todo.model.Todos;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TodoCardDTO {
    private Long id;
    private String item;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;  // Changed from LocalDateTime to LocalDate
    private boolean overdue;
    private Long assignedToId;
    private String assignedToName;
    private Long createdById;
    private String createdByName;
    private Long projectId;
    private String projectName;
    private Long boardId;
    private Long columnId;
    private String columnName;
    private Integer orderIndex;
    private Integer storyPoints;  // Added this
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;

    public static TodoCardDTO fromEntity(Todos todo) {
        TodoCardDTO dto = new TodoCardDTO();
        dto.setId(todo.getId());
        dto.setItem(todo.getItem());
        dto.setDescription(todo.getDescription());
        dto.setStatus(todo.getStatus() != null ? todo.getStatus().name() : null);
        dto.setPriority(todo.getPriority() != null ? todo.getPriority().name() : null);
        dto.setDueDate(todo.getDueDate());
        dto.setOverdue(todo.isOverdue());
        dto.setStoryPoints(todo.getStoryPoints());
        dto.setAssignedToId(todo.getAssignedTo() != null ? todo.getAssignedTo().getId() : null);
        dto.setAssignedToName(todo.getAssignedTo() != null ? todo.getAssignedTo().getName() : null);
        dto.setCreatedById(todo.getCreatedBy() != null ? todo.getCreatedBy().getId() : null);
        dto.setCreatedByName(todo.getCreatedBy() != null ? todo.getCreatedBy().getName() : null);
        dto.setProjectId(todo.getProject() != null ? todo.getProject().getId() : null);
        dto.setProjectName(todo.getProject() != null ? todo.getProject().getName() : null);
        dto.setBoardId(todo.getBoard() != null ? todo.getBoard().getId() : null);
        dto.setColumnId(todo.getBoardColumn() != null ? todo.getBoardColumn().getId() : null);
        dto.setColumnName(todo.getBoardColumn() != null ? todo.getBoardColumn().getName() : null);
        dto.setOrderIndex((int) todo.getOrderIndex());
        dto.setCreatedAt(todo.getCreatedAt());
        dto.setCompletedAt(todo.getCompletedAt());
        return dto;
    }
}