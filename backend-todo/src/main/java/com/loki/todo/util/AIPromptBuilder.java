package com.loki.todo.util;

import com.loki.todo.model.AIContext;
import com.loki.todo.model.EnhancedAIPlan;
import com.loki.todo.model.EnhancedAITask;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class AIPromptBuilder {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public String buildPlanParsingPrompt(String text, Map<String, Object> analysis,
                                         AIContext context, Map<String, Object> preferences) {

        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an expert learning path architect and educational AI assistant. ");
        prompt.append("Your task is to analyze the provided document and create a comprehensive, ");
        prompt.append("structured 60-day learning plan with detailed daily tasks.\n\n");

        prompt.append("## DOCUMENT ANALYSIS\n");
        prompt.append("Word Count: ").append(analysis.get("wordCount")).append("\n");
        prompt.append("Estimated Reading Time: ").append(analysis.get("estimatedReadingTimeMinutes")).append(" minutes\n");
        prompt.append("Complexity Level: ").append(analysis.get("complexity")).append("\n");
        prompt.append("Structure: ");
        if ((boolean) analysis.get("hasHeadings")) prompt.append("Has headings, ");
        if ((boolean) analysis.get("hasBulletPoints")) prompt.append("Has bullet points, ");
        if ((boolean) analysis.get("hasNumberedLists")) prompt.append("Has numbered lists, ");
        prompt.append("\n\n");

        prompt.append("## USER CONTEXT\n");
        prompt.append("Learning Style: ").append(context.getLearningStyle()).append("\n");
        prompt.append("Attention Span: ").append(context.getAttentionSpan()).append(" minutes\n");
        if (preferences != null && !preferences.isEmpty()) {
            prompt.append("User Preferences: ").append(preferences).append("\n");
        }
        prompt.append("\n");

        prompt.append("## DOCUMENT CONTENT\n");
        prompt.append(text);
        prompt.append("\n\n");

        prompt.append("## ANALYSIS INSTRUCTIONS\n");
        prompt.append("1. Identify the main subject area and learning objectives\n");
        prompt.append("2. Extract all topics, subtopics, and concepts mentioned\n");
        prompt.append("3. Identify any mentioned timeframes, milestones, or deadlines\n");
        prompt.append("4. Note any prerequisites or required resources\n");
        prompt.append("5. Understand the progression from basics to advanced concepts\n\n");

        prompt.append("## OUTPUT FORMAT\n");
        prompt.append("Return a JSON object with this exact structure:\n");
        prompt.append("{\n");
        prompt.append("  \"title\": \"Main title of the learning path\",\n");
        prompt.append("  \"description\": \"Brief overview of what will be learned\",\n");
        prompt.append("  \"durationDays\": 60,\n");
        prompt.append("  \"summary\": \"Comprehensive summary of the learning path\",\n");
        prompt.append("  \"difficulty\": \"BEGINNER|INTERMEDIATE|ADVANCED\",\n");
        prompt.append("  \"category\": \"DEVELOPMENT|LANGUAGE|BUSINESS|FITNESS|ACADEMIC\",\n");
        prompt.append("  \"estimatedTotalHours\": 0.0,\n");
        prompt.append("  \"recommendedDailyHours\": 0.0,\n");
        prompt.append("  \"confidenceScore\": 0-100,\n");
        prompt.append("  \"learningObjectives\": [\"string\"],\n");
        prompt.append("  \"prerequisites\": [\"string\"],\n");
        prompt.append("  \"resources\": [\"string\"],\n");
        prompt.append("  \"weeklyBreakdown\": {\n");
        prompt.append("    \"week1\": {\n");
        prompt.append("      \"theme\": \"Week 1 theme\",\n");
        prompt.append("      \"topics\": [\"string\"],\n");
        prompt.append("      \"totalHours\": 0.0\n");
        prompt.append("    }\n");
        prompt.append("  }\n");
        prompt.append("}\n");

        return prompt.toString();
    }

    public String buildTaskGenerationPrompt(EnhancedAIPlan plan, AIContext context) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are creating a detailed 60-day task list for a structured learning path.\n\n");

        prompt.append("## PLAN DETAILS\n");
        prompt.append("Title: ").append(plan.getTitle()).append("\n");
        prompt.append("Description: ").append(plan.getDescription()).append("\n");
        prompt.append("Difficulty: ").append(plan.getDifficulty()).append("\n");
        prompt.append("Category: ").append(plan.getCategory()).append("\n");
        prompt.append("Duration: ").append(plan.getDurationDays()).append(" days\n");
        prompt.append("Estimated Total Hours: ").append(plan.getEstimatedTotalHours()).append("\n");
        prompt.append("Recommended Daily Hours: ").append(plan.getRecommendedDailyHours()).append("\n\n");

        prompt.append("## USER LEARNING STYLE\n");
        prompt.append("Style: ").append(context.getLearningStyle()).append("\n");
        prompt.append("Attention Span: ").append(context.getAttentionSpan()).append(" minutes\n\n");

        prompt.append("## TASK GENERATION RULES\n");
        prompt.append("1. Create 3-5 tasks for each day of the 60-day plan\n");
        prompt.append("2. Tasks should be specific, measurable, and achievable\n");
        prompt.append("3. Include a mix of: reading, practice exercises, projects, and review\n");
        prompt.append("4. Progress from fundamentals to advanced concepts\n");
        prompt.append("5. Include review days every 7 days\n");
        prompt.append("6. Consider the user's learning style and attention span\n");
        prompt.append("7. Add prerequisites where concepts build on each other\n");
        prompt.append("8. Include estimated hours for each task\n\n");

        prompt.append("## OUTPUT FORMAT\n");
        prompt.append("Return a JSON array with this exact structure:\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"dayNumber\": 1,\n");
        prompt.append("    \"weekNumber\": 1,\n");
        prompt.append("    \"title\": \"Clear, actionable task title\",\n");
        prompt.append("    \"description\": \"Detailed description of what to do\",\n");
        prompt.append("    \"priority\": \"HIGH|MEDIUM|LOW\",\n");
        prompt.append("    \"estimatedHours\": 1.5,\n");
        prompt.append("    \"category\": \"Topic category\",\n");
        prompt.append("    \"subCategory\": \"Specific subtopic\",\n");
        prompt.append("    \"tags\": [\"tag1\", \"tag2\"],\n");
        prompt.append("    \"prerequisites\": [\"Concepts needed\"],\n");
        prompt.append("    \"resourceLinks\": [\"JSON array of resource URLs or references\"],\n");
        prompt.append("    \"deliverables\": \"What to produce or complete\",\n");
        prompt.append("    \"parentTaskId\": null,\n");
        prompt.append("    \"orderIndex\": 0\n");
        prompt.append("  }\n");
        prompt.append("]\n");

        return prompt.toString();
    }

    public String buildChatPrompt(String message, Map<String, Object> context,
                                  Map<String, Object> additionalContext) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an intelligent learning assistant helping a user with their ");
        prompt.append("60-day learning journey. You have context about their learning style ");
        prompt.append("and progress. Provide helpful, encouraging, and actionable responses.\n\n");

        prompt.append("## CURRENT CONTEXT\n");
        context.forEach((key, value) -> {
            prompt.append(key).append(": ").append(value).append("\n");
        });

        if (additionalContext != null && !additionalContext.isEmpty()) {
            prompt.append("\n## ADDITIONAL CONTEXT\n");
            additionalContext.forEach((key, value) -> {
                prompt.append(key).append(": ").append(value).append("\n");
            });
        }

        prompt.append("\n## USER MESSAGE\n");
        prompt.append(message).append("\n\n");

        prompt.append("## RESPONSE GUIDELINES\n");
        prompt.append("1. Be encouraging and supportive\n");
        prompt.append("2. Provide specific, actionable advice\n");
        prompt.append("3. Reference their learning style and progress when relevant\n");
        prompt.append("4. Suggest improvements or adjustments if needed\n");
        prompt.append("5. Ask clarifying questions when necessary\n");
        prompt.append("6. Keep responses focused on their learning journey\n");

        return prompt.toString();
    }

    public String buildRefinementPrompt(EnhancedAIPlan plan, List<EnhancedAITask> tasks,
                                        String instructions, AIContext context) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are refining a 60-day learning plan based on user feedback.\n\n");

        prompt.append("## CURRENT PLAN\n");
        prompt.append("Title: ").append(plan.getTitle()).append("\n");
        prompt.append("Description: ").append(plan.getDescription()).append("\n");
        prompt.append("Duration: ").append(plan.getDurationDays()).append(" days\n\n");

        prompt.append("## CURRENT TASKS (First 5)\n");
        tasks.stream().limit(5).forEach(task -> {
            prompt.append("Day ").append(task.getDayNumber()).append(": ")
                    .append(task.getTitle()).append("\n");
        });
        prompt.append("... and ").append(tasks.size() - 5).append(" more tasks\n\n");

        prompt.append("## USER FEEDBACK/INSTRUCTIONS\n");
        prompt.append(instructions).append("\n\n");

        prompt.append("## USER LEARNING STYLE\n");
        prompt.append("Style: ").append(context.getLearningStyle()).append("\n");
        prompt.append("Attention Span: ").append(context.getAttentionSpan()).append(" minutes\n\n");

        prompt.append("## REFINEMENT TASK\n");
        prompt.append("Based on the feedback, adjust the plan and tasks accordingly. ");
        prompt.append("Return the complete updated task list in the same JSON format as before.\n");

        return prompt.toString();
    }
}