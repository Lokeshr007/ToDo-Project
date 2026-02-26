package com.loki.todo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class AIProjectStructureDTO {
    private String projectName;
    private String projectDescription;
    private String projectColor;
    private Long createdProjectId;
    private List<AIBoardStructureDTO> boards;
}