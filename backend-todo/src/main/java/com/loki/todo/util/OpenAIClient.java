package com.loki.todo.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class OpenAIClient {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.url:https://api.openai.com/v1/chat/completions}")
    private String apiUrl;

    @Value("${openai.model:gpt-3.5-turbo}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAIClient() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String sendMessage(String prompt) {
        // If no API key is configured, return mock response for testing
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your-api-key-here")) {
            log.warn("OpenAI API key not configured, returning mock response");
            return getMockResponse(prompt);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", new Object[]{
                    Map.of("role", "user", "content", prompt)
            });
            requestBody.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    apiUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            return extractContentFromResponse(response.getBody());

        } catch (Exception e) {
            log.error("OpenAI API call failed: {}", e.getMessage());
            // Return mock response on error
            return getMockResponse(prompt);
        }
    }

    private String extractContentFromResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        return root.path("choices")
                .get(0)
                .path("message")
                .path("content")
                .asText();
    }

    private String getMockResponse(String prompt) {
        // Return mock responses based on prompt type
        if (prompt.contains("study plan") || prompt.contains("parsing")) {
            return getMockPlanResponse();
        } else if (prompt.contains("tasks") || prompt.contains("Task generation")) {
            return getMockTasksResponse();
        } else {
            return "I'm here to help with your study plan! How can I assist you today?";
        }
    }

    private String getMockPlanResponse() {
        return """
            {
                "title": "60-Day Web Development Study Plan",
                "duration": 60,
                "subjects": ["HTML/CSS", "JavaScript", "React", "Node.js", "MongoDB"],
                "dailyGoals": [
                    {
                        "day": 1,
                        "topics": ["HTML5 Basics", "Semantic Elements"],
                        "hours": 2,
                        "tasks": ["Read HTML5 documentation", "Create a simple webpage", "Practice semantic tags"]
                    },
                    {
                        "day": 2,
                        "topics": ["CSS Fundamentals", "Selectors"],
                        "hours": 2,
                        "tasks": ["Learn CSS syntax", "Style your HTML page", "Practice different selectors"]
                    },
                    {
                        "day": 3,
                        "topics": ["CSS Box Model", "Flexbox"],
                        "hours": 2,
                        "tasks": ["Understand box model", "Build a flexbox layout", "Create responsive cards"]
                    }
                ],
                "milestones": [
                    {
                        "day": 7,
                        "description": "Complete first responsive website"
                    },
                    {
                        "day": 14,
                        "description": "Master JavaScript basics"
                    },
                    {
                        "day": 21,
                        "description": "Build first React component"
                    },
                    {
                        "day": 30,
                        "description": "Complete first full stack feature"
                    }
                ],
                "recommendedHoursPerDay": 4,
                "prerequisites": ["Basic computer knowledge", "Code editor installed"]
            }
            """;
    }

    private String getMockTasksResponse() {
        return """
            [
                {
                    "day": 1,
                    "title": "Set up development environment",
                    "description": "Install VS Code, Node.js, and create first HTML file",
                    "priority": "HIGH",
                    "dueDate": "day-1",
                    "estimatedHours": 1.5,
                    "subject": "Setup",
                    "tags": ["setup", "environment"],
                    "type": "setup"
                },
                {
                    "day": 1,
                    "title": "Complete HTML5 Basics",
                    "description": "Study HTML5 semantic elements and create a simple webpage structure",
                    "priority": "HIGH",
                    "dueDate": "day-1",
                    "estimatedHours": 2.0,
                    "subject": "HTML",
                    "tags": ["html", "basics"],
                    "type": "reading"
                },
                {
                    "day": 1,
                    "title": "HTML Practice Exercises",
                    "description": "Complete 5 HTML exercises focusing on forms and tables",
                    "priority": "MEDIUM",
                    "dueDate": "day-1",
                    "estimatedHours": 1.5,
                    "subject": "HTML",
                    "tags": ["practice", "exercises"],
                    "type": "practice"
                },
                {
                    "day": 2,
                    "title": "CSS Fundamentals",
                    "description": "Learn CSS selectors, properties, and basic styling",
                    "priority": "HIGH",
                    "dueDate": "day-2",
                    "estimatedHours": 2.0,
                    "subject": "CSS",
                    "tags": ["css", "styling"],
                    "type": "reading"
                },
                {
                    "day": 2,
                    "title": "Style Your HTML Page",
                    "description": "Apply CSS to your HTML page from day 1",
                    "priority": "MEDIUM",
                    "dueDate": "day-2",
                    "estimatedHours": 1.5,
                    "subject": "CSS",
                    "tags": ["practice", "project"],
                    "type": "practice"
                },
                {
                    "day": 3,
                    "title": "Master CSS Box Model",
                    "description": "Deep dive into margin, padding, border, and content",
                    "priority": "HIGH",
                    "dueDate": "day-3",
                    "estimatedHours": 1.5,
                    "subject": "CSS",
                    "tags": ["css", "box-model"],
                    "type": "reading"
                },
                {
                    "day": 3,
                    "title": "Build Flexbox Layout",
                    "description": "Create a responsive navigation bar using flexbox",
                    "priority": "MEDIUM",
                    "dueDate": "day-3",
                    "estimatedHours": 2.0,
                    "subject": "CSS",
                    "tags": ["flexbox", "practice"],
                    "type": "practice"
                }
            ]
            """;
    }
}