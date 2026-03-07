// BACKEND-TODO/SRC/main/java/com/loki/todo/dto/TodoDTO.java
package com.loki.todo.dto;

import com.loki.todo.model.Todos;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodoDTO {

    // Existing fields
    private Long id;
    private String title;
    private String description;
    private String status;
    private String priority;
    private LocalDate dueDate;
    private LocalDateTime dueDateTime;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime startedAt;
    private Double estimatedHours;
    private Double actualHours;
    private Integer storyPoints;

    // User/Assignment fields
    private UserDTO createdBy;
    private UserDTO assignedTo;
    private Long assignedToId;

    // Project/Workspace fields
    private Long projectId;
    private String projectName;
    private Long workspaceId;
    private String workspaceName;

    // Board/Column fields
    private Long boardId;
    private String boardName;
    private Long columnId;
    private String columnName;

    // Additional fields
    private List<String> labels;
    private Integer orderIndex;
    private boolean overdue;

    // ========== NEW FIELDS FOR AI ASSISTANT ==========
    private Integer day;              // Day number in the 60-day plan
    private String subject;            // Subject/category of the task
    private List<String> tags;         // Tags for the task
    private Long generatedId;           // ID from AI generated tasks table

    // Helper method to convert from entity
    public static TodoDTO fromEntity(Todos todo) {
        if (todo == null) return null;

        TodoDTO dto = TodoDTO.builder()
                .id(todo.getId())
                .title(todo.getItem())
                .description(todo.getDescription())
                .status(todo.getStatus() != null ? todo.getStatus().name() : "PENDING")
                .priority(todo.getPriority() != null ? todo.getPriority().name() : "NORMAL")
                .dueDate(todo.getDueDate())
                .dueDateTime(todo.getDueDateTime())
                .completedAt(todo.getCompletedAt())
                .createdAt(todo.getCreatedAt())
                .updatedAt(todo.getUpdatedAt())
                .startedAt(todo.getStartedAt())
                .estimatedHours(todo.getEstimatedHours() != null ?
                        todo.getEstimatedHours().doubleValue() : null)
                .actualHours(todo.getActualHours())
                .storyPoints(todo.getStoryPoints())
                .orderIndex((int) todo.getOrderIndex())
                .overdue(todo.isOverdue())
                .labels(todo.getLabels())
                .build();

        // Set user info
        if (todo.getCreatedBy() != null) {
            dto.setCreatedBy(UserDTO.fromEntity(todo.getCreatedBy()));
        }

        if (todo.getAssignedTo() != null) {
            dto.setAssignedTo(UserDTO.fromEntity(todo.getAssignedTo()));
            dto.setAssignedToId(todo.getAssignedTo().getId());
        }

        // Set project info
        if (todo.getProject() != null) {
            dto.setProjectId(todo.getProject().getId());
            dto.setProjectName(todo.getProject().getName());
        }

        // Set workspace info
        if (todo.getWorkspace() != null) {
            dto.setWorkspaceId(todo.getWorkspace().getId());
            dto.setWorkspaceName(todo.getWorkspace().getName());
        }

        // Set board info
        if (todo.getBoard() != null) {
            dto.setBoardId(todo.getBoard().getId());
            dto.setBoardName(todo.getBoard().getName());
        }

        // Set column info
        if (todo.getBoardColumn() != null) {
            dto.setColumnId(todo.getBoardColumn().getId());
            dto.setColumnName(todo.getBoardColumn().getName());
        }

        return dto;
    }
}