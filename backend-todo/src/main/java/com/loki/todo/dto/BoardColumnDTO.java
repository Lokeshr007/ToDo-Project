// BoardColumnDTO.java - Fixed
package com.loki.todo.dto;

import com.loki.todo.model.BoardColumn;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardColumnDTO {
    private Long id;
    private String name;
    private String description;
    private String type;
    private Integer wipLimit;
    private Integer taskCount;
    private Double orderIndex;
    private String color;  // Added this field
    private List<TodoCardDTO> tasks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BoardColumnDTO fromEntity(BoardColumn column) {
        BoardColumnDTO dto = new BoardColumnDTO();
        dto.setId(column.getId());
        dto.setName(column.getName());
        dto.setDescription(column.getDescription());
        dto.setType(column.getType().name());
        dto.setWipLimit(column.getWipLimit());
        dto.setTaskCount(column.getTodos().size());
        dto.setOrderIndex(column.getOrderIndex());
        dto.setColor(column.getColor());  // Set the color
        dto.setCreatedAt(column.getCreatedAt());
        dto.setUpdatedAt(column.getUpdatedAt());

        if (column.getTodos() != null) {
            dto.setTasks(column.getTodos().stream()
                    .map(TodoCardDTO::fromEntity)
                    .collect(Collectors.toList()));
        }

        return dto;
    }
}