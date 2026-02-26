package com.loki.todo.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.loki.todo.dto.EnhancedAIPlanDTO;
import com.loki.todo.dto.EnhancedAITaskDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
public class AIResponseParser {

    private final ObjectMapper objectMapper;

    public AIResponseParser() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    public EnhancedAIPlanDTO parsePlanResponse(String aiResponse) {
        try {
            String cleanedResponse = cleanResponse(aiResponse);
            JsonNode root = objectMapper.readTree(cleanedResponse);

            EnhancedAIPlanDTO plan = new EnhancedAIPlanDTO();

            plan.setTitle(getStringSafely(root, "title", "Learning Plan"));
            plan.setDescription(getStringSafely(root, "description", ""));
            plan.setDurationDays(getIntSafely(root, "durationDays", 60));
            plan.setSummary(getStringSafely(root, "summary", ""));
            plan.setDifficulty(getStringSafely(root, "difficulty", "INTERMEDIATE"));
            plan.setCategory(getStringSafely(root, "category", "DEVELOPMENT"));
            plan.setEstimatedTotalHours(getDoubleSafely(root, "estimatedTotalHours", 0.0));
            plan.setRecommendedDailyHours(getDoubleSafely(root, "recommendedDailyHours", 4.0));
            plan.setConfidenceScore(getIntSafely(root, "confidenceScore", 85));

            return plan;

        } catch (Exception e) {
            log.error("Failed to parse plan response", e);
            return createDefaultPlan();
        }
    }

    public List<EnhancedAITaskDTO> parseTasksResponse(String aiResponse) {
        List<EnhancedAITaskDTO> tasks = new ArrayList<>();

        try {
            String cleanedResponse = cleanResponse(aiResponse);
            JsonNode root = objectMapper.readTree(cleanedResponse);

            if (root.isArray()) {
                for (JsonNode taskNode : root) {
                    EnhancedAITaskDTO task = new EnhancedAITaskDTO();

                    task.setDayNumber(getIntSafely(taskNode, "dayNumber", 1));
                    task.setWeekNumber(getIntSafely(taskNode, "weekNumber", 1));
                    task.setTitle(getStringSafely(taskNode, "title", "Learning Task"));
                    task.setDescription(getStringSafely(taskNode, "description", ""));
                    task.setPriority(getStringSafely(taskNode, "priority", "MEDIUM"));
                    task.setEstimatedHours(getDoubleSafely(taskNode, "estimatedHours", 1.0));
                    task.setCategory(getStringSafely(taskNode, "category", "General"));
                    task.setSubCategory(getStringSafely(taskNode, "subCategory", ""));

                    // Parse arrays
                    if (taskNode.has("tags") && taskNode.get("tags").isArray()) {
                        List<String> tags = new ArrayList<>();
                        for (JsonNode tagNode : taskNode.get("tags")) {
                            tags.add(tagNode.asText());
                        }
                        task.setTags(tags);
                    }

                    if (taskNode.has("prerequisites") && taskNode.get("prerequisites").isArray()) {
                        List<String> prereqs = new ArrayList<>();
                        for (JsonNode prereqNode : taskNode.get("prerequisites")) {
                            prereqs.add(prereqNode.asText());
                        }
                        task.setPrerequisites(prereqs);
                    }

                    task.setResourceLinks(getStringSafely(taskNode, "resourceLinks", "[]"));
                    task.setDeliverables(getStringSafely(taskNode, "deliverables", ""));
                    task.setOrderIndex(getIntSafely(taskNode, "orderIndex", 0));

                    tasks.add(task);
                }
            }

        } catch (Exception e) {
            log.error("Failed to parse tasks response", e);
            return generateDefaultTasks();
        }

        return tasks;
    }

    private String cleanResponse(String response) {
        return response.replaceAll("```json\\s*", "")
                .replaceAll("```\\s*", "")
                .replaceAll("```", "")
                .trim();
    }

    private String getStringSafely(JsonNode node, String field, String defaultValue) {
        return node.has(field) && !node.get(field).isNull() ?
                node.get(field).asText() : defaultValue;
    }

    private int getIntSafely(JsonNode node, String field, int defaultValue) {
        return node.has(field) && !node.get(field).isNull() ?
                node.get(field).asInt() : defaultValue;
    }

    private double getDoubleSafely(JsonNode node, String field, double defaultValue) {
        return node.has(field) && !node.get(field).isNull() ?
                node.get(field).asDouble() : defaultValue;
    }

    private EnhancedAIPlanDTO createDefaultPlan() {
        EnhancedAIPlanDTO plan = new EnhancedAIPlanDTO();
        plan.setTitle("60-Day Learning Plan");
        plan.setDescription("Comprehensive learning path");
        plan.setDurationDays(60);
        plan.setSummary("A structured 60-day learning journey");
        plan.setDifficulty("INTERMEDIATE");
        plan.setCategory("DEVELOPMENT");
        plan.setEstimatedTotalHours(240.0);
        plan.setRecommendedDailyHours(4.0);
        plan.setConfidenceScore(85);
        return plan;
    }

    private List<EnhancedAITaskDTO> generateDefaultTasks() {
        List<EnhancedAITaskDTO> tasks = new ArrayList<>();

        for (int day = 1; day <= 60; day++) {
            EnhancedAITaskDTO task = new EnhancedAITaskDTO();
            task.setDayNumber(day);
            task.setWeekNumber((day - 1) / 7 + 1);
            task.setTitle("Day " + day + " - Learning Session");
            task.setDescription("Complete today's learning activities and practice exercises");
            task.setPriority("MEDIUM");
            task.setEstimatedHours(2.0);
            task.setCategory("General");
            task.setTags(List.of("daily", "learning"));
            task.setPrerequisites(new ArrayList<>());
            task.setOrderIndex(0);
            tasks.add(task);
        }

        return tasks;
    }
}