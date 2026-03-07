package com.loki.todo.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Component
public class OpenAIClient {

    @Value("${openai.api.key:}")
    private String apiKey;

    @Value("${openai.api.version:v1beta}")
    private String apiVersion;

    @Value("${openai.api.url:https://generativelanguage.googleapis.com}")
    private String apiUrl;

    @Value("${openai.model:gemini-1.5-flash}")
    private String model;

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public OpenAIClient() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    public String sendMessage(String prompt) {
        return sendMessage(prompt, "You are a helpful, professional, and intelligent AI assistant for the ToDo Productivity Platform.");
    }

    public String sendMessage(String prompt, String systemPrompt) {
        // If no API key is configured, rely on our Custom Java Inference Engine
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("your-api-key-here")) {
            log.warn("AI API key not configured, falling back to Custom Java Engine");
            return getMockResponse(prompt);
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // Construct dynamic URL: baseUrl/version/models/modelName:generateContent
            String finalUrl = String.format("%s/%s/models/%s:generateContent?key=%s", 
                apiUrl, apiVersion, model, apiKey);

            log.debug("Calling AI API: {}", finalUrl.replace(apiKey, "HIDDEN"));

            // Structure the Gemini request body
            Map<String, Object> textPart = new HashMap<>();
            String fullPrompt = (systemPrompt != null && !systemPrompt.isEmpty()) 
                ? systemPrompt + "\n\n" + prompt 
                : prompt;
            textPart.put("text", fullPrompt);

            Map<String, Object> partsMap = new HashMap<>();
            partsMap.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(partsMap));

            Map<String, Object> genConfig = new HashMap<>();
            genConfig.put("temperature", 0.7);
            
            if (prompt.contains("JSON")) {
                genConfig.put("responseMimeType", "application/json");
            }
            requestBody.put("generationConfig", genConfig);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    finalUrl,
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            log.info("AI API Response Status: {}", response.getStatusCode());
            return extractContentFromResponse(response.getBody());

        } catch (Exception e) {
            log.error("AI API call failed: ", e);
            String lower = prompt.toLowerCase();
            
            // Handle 404/NOT_FOUND specifically
            if (e.getMessage() != null && e.getMessage().contains("404")) {
                log.warn("Received 404 for Gemini model '{}'. Consider trying 'v1' or 'gemini-1.5-flash-latest'.", model);
            }

            // If the prompt is asking for JSON (like Plan or Task generation), we can still fallback to the offline generator.
            if (lower.contains("json") || lower.contains("weeklybreakdown") || lower.contains("daynumber")) {
                log.warn("Auto-switching to Offline Custom Java Parsing Engine for JSON payload!");
                return getMockResponse(prompt);
            }
            
            // For general chat, we should explicitly inform the user that their API is failing instead of repeating a static hardcoded message.
            String errorMsg = e.getMessage() != null ? e.getMessage() : "Unknown API error";
            
            // Formatting the error message for the frontend to display nicely
            return "⚠️ **AI Connection Error**: I am unable to process your request because the Google Gemini API call failed. \n\n" +
                   "**Details**: `" + errorMsg + "`\n\n" +
                   "This usually happens when your API key has reached its rate limit, run out of credits, or is configured incorrectly. Please check your Google AI Studio dashboard, generate a new active API key, and update your backend `application.properties`. \n\n" +
                   "*Troubleshooting Tip*: If you are seeing a 404, try changing `openai.api.version` to `v1` or `openai.model` to `gemini-1.5-flash-latest`.*";
        }
    }

    private String extractContentFromResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        
        // Handle Gemini format
        if (root.has("candidates") && root.get("candidates").isArray() && root.get("candidates").size() > 0) {
            JsonNode candidate = root.get("candidates").get(0);
            
            // Check for safety finish reason
            if (candidate.has("finishReason") && "SAFETY".equals(candidate.get("finishReason").asText())) {
                log.warn("Gemini safety block triggered!");
                return "I apologize, but I cannot process this specific content due to safety guidelines. Please provide a different document or instructions.";
            }

            JsonNode parts = candidate.path("content").path("parts");
            if (parts.isArray() && parts.size() > 0) {
                return parts.get(0).path("text").asText();
            }
        }
        
        // Handle errors
        if (root.has("error")) {
            return "AI API Error: " + root.get("error").path("message").asText();
        }
        
        return "The AI was unable to generate a text response. Please try again or check your API configuration.";
    }

    private String getMockResponse(String prompt) {
        String lower = prompt.toLowerCase();
        
        // Smart Local Java Extract Engine
        if (prompt.contains("Return a JSON object with this exact structure") || prompt.contains("weeklyBreakdown")) {
            // Dynamically construct plan based on user's uploaded file text
            String title = "Custom Learning Plan";
            if (lower.contains("java") || lower.contains("spring")) title = "Java Backend & Spring Framework Plan";
            else if (lower.contains("dsa") || lower.contains("data structure") || lower.contains("algorithm") || lower.contains("leetcode")) title = "DSA & Competitive Programming Mastery";
            else if (lower.contains("react") || lower.contains("frontend") || lower.contains("javascript") || lower.contains("web")) title = "Modern Frontend Ecosystem Roadmap";
            else if (lower.contains("machine learning") || lower.contains("ai") || lower.contains("python")) title = "Machine Learning & AI Preparation";
            
            return "{\n" +
                   "  \"title\": \"" + title + "\",\n" +
                   "  \"description\": \"Comprehensive learning path for " + title + "\",\n" +
                   "  \"durationDays\": 60,\n" +
                   "  \"summary\": \"A structured 60-day journey to mastering " + title + ".\",\n" +
                   "  \"difficulty\": \"INTERMEDIATE\",\n" +
                   "  \"category\": \"DEVELOPMENT\",\n" +
                   "  \"estimatedTotalHours\": 120.0,\n" +
                   "  \"recommendedDailyHours\": 2.0,\n" +
                   "  \"confidenceScore\": 95,\n" +
                   "  \"learningObjectives\": [\"Master core concepts\", \"Build real projects\", \"Understand best practices\"]\n" +
                   "}";
        } else if (prompt.contains("Return a JSON array") || prompt.contains("dayNumber")) {
            return getMockTasksResponse(prompt);
        } else {
            return getMockChatResponse(prompt);
        }
    }

    private String getMockChatResponse(String prompt) {
        // Extract the actual user message if possible
        String lower = prompt.toLowerCase();
        if (lower.contains("pending") || lower.contains("tasks") || lower.contains("todo")) {
            return "Based on your current workload, I can see you have some pending tasks. I recommend prioritizing your high-priority items first and using time-blocking to focus on one task at a time. Would you like me to help organize your task list?";
        } else if (lower.contains("goal")) {
            return "Setting clear, measurable goals is key to productivity. Break your goals into smaller milestones and track your progress regularly. Your active goals show you're on the right track!";
        } else if (lower.contains("project")) {
            return "Project management works best when tasks are clearly defined and assigned. Make sure each task in your projects has a clear owner and due date. Would you like tips on prioritizing your projects?";
        } else if (lower.contains("help") || lower.contains("how")) {
            return "I'm your AI productivity assistant! I can help you:\n• Analyze and structure your study plans\n• Generate actionable tasks from documents\n• Provide time management advice\n• Answer questions about your projects and tasks\n\nWhat would you like to work on?";
        }
        return "I'm your AI productivity assistant here to help you stay organized and achieve your goals! I can analyze study plans, generate tasks, and provide personalized productivity advice based on your current workload. What would you like help with today?";
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

    private String getMockTasksResponse(String prompt) {
        String lower = prompt.toLowerCase();
        
        // Extract content between any extraction header and the next known header block
        String curriculumContent = "";
        String[] extractionHeaders = {"## ORIGINAL DOCUMENT CONTENT", "## ORIGINAL PDF CONTENT", "## PLAN EXTRACTION CONTEXT"};
        
        for (String header : extractionHeaders) {
            if (prompt.contains(header)) {
                String sub = prompt.substring(prompt.indexOf(header) + header.length());
                // Clean up trailing headers
                String[] terminateHeaders = {"## USER LEARNING STYLE", "## TASK GENERATION RULES", "## OUTPUT FORMAT", "## ANALYSIS INSTRUCTIONS", "## USER CONTEXT"};
                int endIdx = sub.length();
                for (String term : terminateHeaders) {
                    int idx = sub.indexOf(term);
                    if (idx != -1 && idx < endIdx) endIdx = idx;
                }
                curriculumContent += sub.substring(0, endIdx) + "\n";
            }
        }
        
        curriculumContent = curriculumContent.trim();
        
        // If we found any content at all, use the Smart Parser
        if (!curriculumContent.isEmpty()) {
            log.info("Performing Ultra-Aggressive Smart Parsing on content (Length: {})", curriculumContent.length());
            String result = generateSmartJsonFromText(curriculumContent);
            if (result.contains("dayNumber")) {
                return result;
            }
        }
        
        // Always prioritize the Smart Parser if we have ANY content
        if (!curriculumContent.isEmpty()) {
            // Check if it's an OCR failure message
            if (curriculumContent.contains("no selectable text") || curriculumContent.contains("image-based")) {
                log.warn("Document appears to be image-based. Falling back to keyword-based generation.");
            } else {
                log.info("Performing Ultimate Smart Parsing on content (Length: {})", curriculumContent.length());
                String result = generateSmartJsonFromText(curriculumContent);
                // We want at least 3 tasks to consider it a "success"
                int count = 0;
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("dayNumber").matcher(result);
                while (m.find()) count++;
                
                if (count >= 3) {
                    return result;
                }
                log.warn("Smart Parser only found {} tasks, which is too few. Falling back to keywords.", count);
            }
        }
        
        // Basic keyword-based fallback if no structured curriculum was found
        if (lower.contains("dsa") || lower.contains("data structure") || lower.contains("algorithm") || lower.contains("roadmap") || lower.contains("competitive")) {
            StringBuilder dsaJson = new StringBuilder("[\n");
            String[] topics = {
                "Time & Space Complexity", "Array Basics & Dynamic Arrays", "Two Pointers Technique", "Sliding Window Pattern",
                "Linked List Fundamentals", "Slow & Fast Pointers", "Merge Intervals", "Cyclic Sort Pattern",
                "In-place Reversal of Linked List", "Tree BFS & DFS Traversal", "Binary Search Mastery", "Bitwise XOR Pattern",
                "Top K Elements (Heaps)", "K-way Merge", "Subsets & Permutations", "Backtracking Basics",
                "Dynamic Programming (Memoization)", "DP (Tabulation)", "Knapsack Problems", "Longest Common Subsequence",
                "Graph Basics (Adj List)", "BFS & DFS in Graphs", "Dijkstra's Algorithm", "Bellman Ford",
                "Segment Trees Basics", "Trie Implementation", "Disjoint Set Union", "Kruskal's MST",
                "Topological Sort", "Final Mock Interview & Revision"
            };
            
            for (int i = 0; i < topics.length; i++) {
                if (i > 0) dsaJson.append(",\n");
                dsaJson.append("  { \"dayNumber\": ").append(i + 1)
                      .append(", \"title\": \"").append(topics[i]).append("\", \"description\": \"Master ").append(topics[i])
                      .append(" through theory and 5 practice problems.\", \"priority\": \"HIGH\", \"estimatedHours\": 3.0, \"category\": \"DSA\", \"type\": \"task\" }");
            }
            dsaJson.append("\n]");
            return dsaJson.toString();
        }
        
        return """
            [
                {
                    "dayNumber": 1,
                    "title": "Set up development environment",
                    "description": "Install VS Code, Node.js, and create first HTML file",
                    "priority": "HIGH",
                    "dueDate": "day-1",
                    "estimatedHours": 1.5,
                    "category": "Setup",
                    "tags": ["setup", "environment"],
                    "type": "setup"
                },
                {
                    "dayNumber": 1,
                    "title": "Complete HTML5 Basics",
                    "description": "Study HTML5 semantic elements and create a simple webpage structure",
                    "priority": "HIGH",
                    "dueDate": "day-1",
                    "estimatedHours": 2.0,
                    "category": "HTML",
                    "tags": ["html", "basics"],
                    "type": "reading"
                },
                {
                    "dayNumber": 1,
                    "title": "HTML Practice Exercises",
                    "description": "Complete 5 HTML exercises focusing on forms and tables",
                    "priority": "MEDIUM",
                    "dueDate": "day-1",
                    "estimatedHours": 1.5,
                    "category": "HTML",
                    "tags": ["practice", "exercises"],
                    "type": "practice"
                },
                {
                    "dayNumber": 2,
                    "title": "CSS Fundamentals",
                    "description": "Learn CSS selectors, properties, and basic styling",
                    "priority": "HIGH",
                    "dueDate": "day-2",
                    "estimatedHours": 2.0,
                    "category": "CSS",
                    "tags": ["css", "styling"],
                    "type": "reading"
                },
                {
                    "dayNumber": 2,
                    "title": "Style Your HTML Page",
                    "description": "Apply CSS to your HTML page from day 1",
                    "priority": "MEDIUM",
                    "dueDate": "day-2",
                    "estimatedHours": 1.5,
                    "category": "CSS",
                    "tags": ["practice", "project"],
                    "type": "practice"
                },
                {
                    "dayNumber": 3,
                    "title": "Master CSS Box Model",
                    "description": "Deep dive into margin, padding, border, and content",
                    "priority": "HIGH",
                    "dueDate": "day-3",
                    "estimatedHours": 1.5,
                    "category": "CSS",
                    "tags": ["css", "box-model"],
                    "type": "reading"
                },
                {
                    "dayNumber": 3,
                    "title": "Build Flexbox Layout",
                    "description": "Create a responsive navigation bar using flexbox",
                    "priority": "MEDIUM",
                    "dueDate": "day-3",
                    "estimatedHours": 2.0,
                    "category": "CSS",
                    "tags": ["flexbox", "practice"],
                    "type": "practice"
                }
            ]
            """;
    }

    private String generateSmartJsonFromText(String text) {
        StringBuilder json = new StringBuilder("[\n");
        String[] lines = text.split("\n");
        int day = 1;
        int taskCount = 0;
        String currentTopic = "Learning Path";
        
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty() || trimmed.length() < 3) continue;
            
            // Detect Section/Phase/Week markers to update category
            if (trimmed.startsWith("Phase") || trimmed.startsWith("Week") || trimmed.startsWith("Section") || 
                trimmed.matches("(?i)^Week [0-9]+.*") || trimmed.matches("(?i)^Phase [0-9]+.*") ||
                trimmed.startsWith("###") || trimmed.startsWith("#")) {
                currentTopic = trimmed.replaceAll("^[#\\s•]+", "").trim();
                continue;
            }
            
            // Clean the line for better matching
            String cleanLine = trimmed.replaceAll("^[•\\*\\-0-9\\.\\s]+", "").trim();
            if (cleanLine.length() < 3 || cleanLine.equalsIgnoreCase(currentTopic)) continue;

            // ULTRA AGGRESSIVE: If it's not a header, not too long, and has some alphabetical chars, it's a task!
            if (cleanLine.length() < 120 && cleanLine.matches(".*[a-zA-Z].*")) {
                String description = "Comprehensive study and implementation of " + cleanLine + " as part of the " + currentTopic + " curriculum.";
                
                if (taskCount > 0) json.append(",\n");
                
                json.append("  {\n")
                    .append("    \"dayNumber\": ").append(day).append(",\n")
                    .append("    \"weekNumber\": ").append((day - 1) / 7 + 1).append(",\n")
                    .append("    \"title\": \"").append(escapeJson(cleanLine)).append("\",\n")
                    .append("    \"description\": \"Study and implement ").append(escapeJson(cleanLine)).append(" as part of the ").append(escapeJson(currentTopic)).append(" curriculum.\",\n")
                    .append("    \"priority\": \"").append(day % 4 == 0 ? "HIGH" : "MEDIUM").append("\",\n")
                    .append("    \"estimatedHours\": 2.5,\n")
                    .append("    \"category\": \"").append(escapeJson(currentTopic)).append("\",\n")
                    .append("    \"type\": \"task\"\n")
                    .append("  }");
                
                taskCount++;
                // Scale items per day based on volume, but target 2-3 per day
                if (taskCount % 2 == 0) day++;
                
                // No limits! Let's get them all.
                if (taskCount >= 500) break;
            }
        }
        
        json.append("\n]");
        
        // If we found NO tasks, return a simple empty list signal so parent knows to fallback
        if (taskCount == 0) {
            return "[]";
        }
        
        log.info("Successfully reverse-engineered {} tasks from document text!", taskCount);
        return json.toString();
    }

    private String escapeJson(String str) {
        if (str == null) return "";
        return str.replace("\\", "\\\\")
                  .replace("\"", "\\\"")
                  .replace("\b", "\\b")
                  .replace("\f", "\\f")
                  .replace("\n", "\\n")
                  .replace("\r", "\\r")
                  .replace("\t", "\\t");
    }

    private String getStaticFallbackTasks() {
        StringBuilder sb = new StringBuilder("[\n");
        for (int i = 1; i <= 30; i++) {
            if (i > 1) sb.append(",\n");
            sb.append("  { \"dayNumber\": ").append(i)
              .append(", \"title\": \"Study Session - Day ").append(i).append("\"")
              .append(", \"description\": \"Focus on core curriculum concepts and practical implementation.\"")
              .append(", \"priority\": \"MEDIUM\", \"estimatedHours\": 2.0, \"category\": \"General\", \"type\": \"reading\" }");
        }
        sb.append("\n]");
        return sb.toString();
    }
}