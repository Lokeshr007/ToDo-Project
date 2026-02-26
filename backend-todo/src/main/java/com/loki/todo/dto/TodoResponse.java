package com.loki.todo.dto;

import com.loki.todo.model.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@NoArgsConstructor
public class TodoResponse {
    private Long id;
    private String item;
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
    private Integer estimatedHours;
    private Integer actualHours;
    private Integer storyPoints;
    private boolean overdue;

    // Related entities
    private UserSummary assignedTo;
    private UserSummary createdBy;
    private ProjectSummary project;
    private BoardSummary board;
    private ColumnSummary boardColumn;

    public static TodoResponse fromEntity(Todos todo) {
        if (todo == null) return null;

        TodoResponse response = new TodoResponse();
        response.setId(todo.getId());
        response.setItem(todo.getItem());
        response.setTitle(todo.getItem());
        response.setDescription(todo.getDescription());
        response.setStatus(todo.getStatus() != null ? todo.getStatus().name() : "PENDING");
        response.setPriority(todo.getPriority() != null ? todo.getPriority().name() : "NORMAL");
        response.setDueDate(todo.getDueDate());
        response.setDueDateTime(todo.getDueDateTime());
        response.setCompletedAt(todo.getCompletedAt());
        response.setCreatedAt(todo.getCreatedAt());
        response.setUpdatedAt(todo.getUpdatedAt());
        response.setStartedAt(todo.getStartedAt());
        response.setEstimatedHours(todo.getEstimatedHours());
        response.setActualHours(todo.getActualHours());
        response.setStoryPoints(todo.getStoryPoints());
        response.setOverdue(todo.isOverdue());

        if (todo.getAssignedTo() != null) {
            response.setAssignedTo(UserSummary.fromEntity(todo.getAssignedTo()));
        }

        if (todo.getCreatedBy() != null) {
            response.setCreatedBy(UserSummary.fromEntity(todo.getCreatedBy()));
        }

        if (todo.getProject() != null) {
            response.setProject(ProjectSummary.fromEntity(todo.getProject()));
        }

        if (todo.getBoard() != null) {
            response.setBoard(BoardSummary.fromEntity(todo.getBoard()));
        }

        if (todo.getBoardColumn() != null) {
            response.setBoardColumn(ColumnSummary.fromEntity(todo.getBoardColumn()));
        }

        return response;
    }

    @Data
    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
        private String profilePicture;

        public static UserSummary fromEntity(User user) {
            if (user == null) return null;
            UserSummary summary = new UserSummary();
            summary.setId(user.getId());
            summary.setName(user.getName());
            summary.setEmail(user.getEmail());
            summary.setProfilePicture(user.getProfilePicture());
            return summary;
        }
    }

    @Data
    public static class ProjectSummary {
        private Long id;
        private String name;
        private String color;

        public static ProjectSummary fromEntity(Project project) {
            if (project == null) return null;
            ProjectSummary summary = new ProjectSummary();
            summary.setId(project.getId());
            summary.setName(project.getName());
            summary.setColor(project.getColor());
            return summary;
        }
    }

    @Data
    public static class BoardSummary {
        private Long id;
        private String name;

        public static BoardSummary fromEntity(Board board) {
            if (board == null) return null;
            BoardSummary summary = new BoardSummary();
            summary.setId(board.getId());
            summary.setName(board.getName());
            return summary;
        }
    }

    @Data
    public static class ColumnSummary {
        private Long id;
        private String name;

        public static ColumnSummary fromEntity(BoardColumn column) {
            if (column == null) return null;
            ColumnSummary summary = new ColumnSummary();
            summary.setId(column.getId());
            summary.setName(column.getName());
            return summary;
        }
    }
}