package com.loki.todo.dto;

import lombok.Data;

@Data
public class BoardMoveDTO {
    private Long taskId;
    private Long fromColumnId;
    private Long toColumnId;
    private Integer newIndex;
}