package com.loki.todo.dto;

import lombok.Data;

import java.util.List;

@Data
public class AIColumnStructureDTO {
    private String columnName;
    private String columnType;
    private String columnColor;
    private Integer orderIndex;
    private Integer wipLimit;
    private Long createdColumnId;
    private List<EnhancedAITaskDTO> tasks;
}
