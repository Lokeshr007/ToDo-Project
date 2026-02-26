// BoardActivityDTO.java - Fixed
package com.loki.todo.dto;

import com.loki.todo.model.BoardActivity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BoardActivityDTO {
    private Long id;
    private String type;
    private String description;
    private String performedBy;
    private String todoTitle;
    private String sourceColumn;
    private String targetColumn;
    private LocalDateTime timestamp;
    private String metadata;

    public static BoardActivityDTO fromEntity(BoardActivity activity) {
        BoardActivityDTO dto = new BoardActivityDTO();
        dto.setId(activity.getId());
        dto.setType(activity.getType().name());
        dto.setDescription(activity.getDescription());
        dto.setPerformedBy(activity.getPerformedBy() != null ?
                activity.getPerformedBy().getName() : "System");
        dto.setTodoTitle(activity.getTodo() != null ? activity.getTodo().getItem() : null);
        dto.setSourceColumn(activity.getSourceColumn() != null ?
                activity.getSourceColumn().getName() : null);
        dto.setTargetColumn(activity.getTargetColumn() != null ?
                activity.getTargetColumn().getName() : null);
        dto.setTimestamp(activity.getTimestamp());
        dto.setMetadata(activity.getMetadata());
        return dto;
    }
}