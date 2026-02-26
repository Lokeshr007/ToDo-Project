// com/loki/todo/dto/WorkspaceSummaryDTO.java
package com.loki.todo.dto;

import com.loki.todo.model.Workspace;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceSummaryDTO {
    private Long id;
    private String name;
    private String description;
    private String logoUrl;
    private String type;
    private boolean active;

    public static WorkspaceSummaryDTO fromEntity(Workspace workspace) {
        return new WorkspaceSummaryDTO(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                workspace.getLogoUrl(),
                workspace.getType().name(),
                workspace.isActive()
        );
    }
}