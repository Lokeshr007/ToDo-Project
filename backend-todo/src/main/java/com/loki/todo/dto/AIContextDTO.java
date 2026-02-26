package com.loki.todo.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
public class AIContextDTO {
    private String sessionId;
    private String learningStyle;
    private Integer attentionSpan;
    private List<String> strengths;
    private List<String> weaknesses;
    private Double progressRate;
    private Integer interactionCount;
    private LocalDateTime lastInteraction;
    private Map<String, Object> userPreferences;
    private List<AIContextMessageDTO> recentMessages;
}

