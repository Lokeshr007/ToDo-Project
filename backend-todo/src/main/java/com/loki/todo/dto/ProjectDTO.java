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
    private Long completedTaskCount;
    private Double completionPercentage;
    private java.util.Map<String, Long> tasksByStatus;

    private java.util.List<MemberDTO> members;

    public static ProjectDTO fromEntity(Project project, Long boardCount, Long taskCount, 
                                       Long completedTaskCount, Double completionPercentage,
                                       java.util.Map<String, Long> tasksByStatus) {
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
        dto.setCompletedTaskCount(completedTaskCount);
        dto.setCompletionPercentage(completionPercentage);
        dto.setTasksByStatus(tasksByStatus);
        
        if (project.getMembers() != null) {
            dto.setMembers(project.getMembers().stream()
                .map(u -> {
                    MemberDTO m = new MemberDTO();
                    m.setId(u.getId()); // Fix: Pass user ID as the member ID
                    m.setUserId(u.getId());
                    m.setName(u.getName());
                    m.setEmail(u.getEmail());
                    return m;
                })
                .collect(java.util.stream.Collectors.toList()));
        }
        
        return dto;
    }


}