// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\dto\AIBoardStructureDTO.java
package com.loki.todo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class AIBoardStructureDTO {
    private String boardName;
    private String boardDescription;
    private String boardColor;
    private Integer orderIndex;
    private Long createdBoardId;
    private List<AIColumnStructureDTO> columns;
}