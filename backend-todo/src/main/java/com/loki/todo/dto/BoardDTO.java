package com.loki.todo.dto;

import com.loki.todo.model.Board;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardDTO {
    private Long id;
    private String name;
    private String description;
    private String color;
    private Long projectId;
    private String projectName;
    private double orderIndex;
    private long taskCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BoardDTO fromEntity(Board board, long taskCount) {
        BoardDTO dto = new BoardDTO();
        dto.setId(board.getId());
        dto.setName(board.getName());
        dto.setDescription(board.getDescription());
        dto.setColor(board.getColor());
        dto.setOrderIndex(board.getOrderIndex());
        dto.setCreatedAt(board.getCreatedAt());
        dto.setUpdatedAt(board.getUpdatedAt());
        dto.setTaskCount(taskCount);

        if (board.getProject() != null) {
            dto.setProjectId(board.getProject().getId());
            dto.setProjectName(board.getProject().getName());
        }

        return dto;
    }
}