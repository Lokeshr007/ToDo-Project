package com.loki.todo.dto;

import com.loki.todo.model.Project;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private String color;
    private Long workspaceId;
    private String workspaceName;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private Long boardCount;
    private Long taskCount;

    public static ProjectDTO fromEntity(Project project, Long boardCount, Long taskCount) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setColor(project.getColor());
        dto.setWorkspaceId(project.getWorkspace().getId());
        dto.setWorkspaceName(project.getWorkspace().getName());
        dto.setCreatedById(project.getCreatedBy().getId());
        dto.setCreatedByName(project.getCreatedBy().getName());
        dto.setCreatedAt(project.getCreatedAt());
        dto.setBoardCount(boardCount);
        dto.setTaskCount(taskCount);
        return dto;
    }


}