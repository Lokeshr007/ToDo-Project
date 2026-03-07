package com.loki.todo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loki.todo.dto.TodoRequest;
import com.loki.todo.model.Todos;
import com.loki.todo.util.OpenAIClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AINaturalLanguageProcessor {

    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    public Map<String, Object> parseIntent(String input) {
        String prompt = String.format("""
            Analyze this productivity request: "%s"
            
            Current time: %s
            
            Extract the intent and structured data.
            Return JSON:
            {
              "intent": "CREATE_TASK | SET_REMINDER | ANALYZE_PROGRESS | GENERATE_PLAN",
              "confidence": 0.0-1.0,
              "task": {
                "title": "String",
                "description": "String",
                "priority": "HIGH|MEDIUM|LOW",
                "dueDate": "ISO Date String",
                "labels": ["String"]
              },
              "suggestion": "Brief AI response"
            }
            """, input, LocalDateTime.now());

        try {
            String response = openAIClient.sendMessage(prompt);
            return objectMapper.readValue(response, Map.class);
        } catch (Exception e) {
            log.error("AI intent parsing failed", e);
            return new HashMap<>();
        }
    }

    public TodoRequest convertToTodoRequest(String naturalLanguage) {
        Map<String, Object> intent = parseIntent(naturalLanguage);
        if (intent.get("task") == null) return null;

        Map<String, Object> taskData = (Map<String, Object>) intent.get("task");
        TodoRequest request = new TodoRequest();
        request.setItem((String) taskData.get("title"));
        request.setDescription((String) taskData.get("description"));
        request.setPriority((String) taskData.get("priority"));
        // Additional mapping logic...
        return request;
    }
}
