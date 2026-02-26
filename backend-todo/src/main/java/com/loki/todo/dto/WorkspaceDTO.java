// com/loki/todo/dto/WorkspaceDTO.java
package com.loki.todo.dto;

import com.loki.todo.model.Workspace;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkspaceDTO {
    private Long id;
    private String name;
    private String description;
    private String logoUrl;
    private String type;
    private Long ownerId;
    private String ownerName;
    private Long memberCount;
    private Long projectCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean active;

    public static WorkspaceDTO fromEntity(Workspace workspace, Long memberCount, Long projectCount) {
        return new WorkspaceDTO(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                workspace.getLogoUrl(),
                workspace.getType().name(),
                workspace.getOwner() != null ? workspace.getOwner().getId() : null,
                workspace.getOwner() != null ? workspace.getOwner().getName() : null,
                memberCount,
                projectCount,
                workspace.getCreatedAt(),
                workspace.getUpdatedAt(),
                workspace.isActive()
        );
    }
}