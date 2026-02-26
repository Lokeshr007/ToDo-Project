package com.loki.todo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ActivityDTO {
    private Long id;
    private String type;
    private String action;
    private String targetType;
    private String targetId;
    private String targetName;
    private String description;
    private LocalDateTime timestamp;
    private String icon;
    private String color;
    private Map<String, Object> metadata;
}