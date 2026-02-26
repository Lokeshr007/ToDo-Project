// BoardDetailsDTO.java - Fixed
package com.loki.todo.dto;

import com.loki.todo.model.Board;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardDetailsDTO {
    private Long id;
    private String name;
    private Long projectId;
    private String projectName;
    private List<BoardColumnDTO> columns;
    private List<BoardActivityDTO> activities;
    private BoardStatsDTO stats;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BoardDetailsDTO fromEntity(Board board, List<BoardColumnDTO> columns,
                                             List<BoardActivityDTO> activities, BoardStatsDTO stats) {
        BoardDetailsDTO dto = new BoardDetailsDTO();
        dto.setId(board.getId());
        dto.setName(board.getName());
        dto.setProjectId(board.getProject().getId());
        dto.setProjectName(board.getProject().getName());
        dto.setColumns(columns);
        dto.setActivities(activities);
        dto.setStats(stats);
        return dto;
    }
}