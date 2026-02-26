// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\dto\EnterpriseAIRequestDTO.java
package com.loki.todo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@Data
@NoArgsConstructor
public class EnterpriseAIRequestDTO {
    private String action; // PARSE_PLAN, GENERATE_TASKS, CHAT, REFINE
    private String sessionId;
    private Long workspaceId;
    private Long planId;
    private String message;
    private MultipartFile file;
    private String fileContent;
    private String fileType;
    private Boolean createProject = true;
    private String learningStyle;
    private Integer attentionSpan;
    private Map<String, Object> userPreferences;
    private Map<String, Object> context;
}