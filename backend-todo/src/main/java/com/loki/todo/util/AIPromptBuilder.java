package com.loki.todo.util;

import com.loki.todo.model.AIContext;
import com.loki.todo.model.AIContextMessage;
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
        int duration = (analysis.containsKey("durationDays") && (int) analysis.get("durationDays") > 0) 
            ? (int) analysis.get("durationDays") : 60;
        
        prompt.append("Your task is to analyze the provided document and create a comprehensive, ");
        prompt.append("structured ").append(duration).append("-day learning plan with detailed daily tasks.\n\n");

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
        prompt.append("  \"durationDays\": ").append(duration).append(",\n");
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
        prompt.append("    \"week1\": { \"theme\": \"...\", \"topics\": [...], \"totalHours\": 0.0 },\n");
        prompt.append("    \"... (Include ALL weeks for the full ").append(duration).append("-day duration)\": {}\n");
        prompt.append("  }\n");
        prompt.append("}\n");
        prompt.append("\nCRITICAL: You MUST cover the requested timeframe.");

        return prompt.toString();
    }

    public String buildTaskGenerationPrompt(EnhancedAIPlan plan, AIContext context, Map<String, Object> additionalContext) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("You are creating a detailed 60-day task list for a structured learning path.\n\n");
        
        if (additionalContext != null && additionalContext.containsKey("teamMembers")) {
            prompt.append("## TEAM MEMBERS\n");
            prompt.append("You can assign tasks to the following members using their ID:\n");
            prompt.append(additionalContext.get("teamMembers")).append("\n\n");
        }

        prompt.append("## PLAN DETAILS\n");
        prompt.append("Title: ").append(plan.getTitle()).append("\n");
        prompt.append("Description: ").append(plan.getDescription()).append("\n");
        prompt.append("Difficulty: ").append(plan.getDifficulty()).append("\n");
        prompt.append("Category: ").append(plan.getCategory()).append("\n");
        prompt.append("Duration: ").append(plan.getDurationDays()).append(" days\n");
        prompt.append("Estimated Total Hours: ").append(plan.getEstimatedTotalHours()).append("\n");
        prompt.append("Recommended Daily Hours: ").append(plan.getRecommendedDailyHours()).append("\n\n");

        if (plan.getParsedPlanJson() != null && !plan.getParsedPlanJson().isEmpty() && !plan.getParsedPlanJson().equals("{}")) {
            prompt.append("## PLAN EXTRACTION CONTEXT\n");
            prompt.append("Below is the specific breakdown extracted from the PDF previously. You MUST use this to generate the tasks accurately:\n");
            prompt.append(plan.getParsedPlanJson()).append("\n\n");
        } 
        
        // ALWAYS include raw content if available as it contains the original list of 100+ tasks
        if (plan.getRawContent() != null && !plan.getRawContent().isEmpty()) {
            prompt.append("## ORIGINAL DOCUMENT CONTENT\n");
            prompt.append("Below is the full original content from the uploaded document. This is highly important for detail:\n");
            prompt.append(plan.getRawContent()).append("\n\n");
        }

        prompt.append("## USER LEARNING STYLE\n");
        prompt.append("Style: ").append(context.getLearningStyle()).append("\n");
        prompt.append("Attention Span: ").append(context.getAttentionSpan()).append(" minutes\n\n");

        prompt.append("## TASK GENERATION RULES\n");
        prompt.append("1. CRITICAL: You MUST read the full Plan and generate tasks for the ENTIRE ").append(plan.getDurationDays()).append("-day duration.\n");
        prompt.append("2. CHRONOLOGICAL PROGRESSION: You MUST structure the topics logically. Foundational topics (e.g. installing tools, basics) MUST appear in Week 1. Advanced topics MUST appear in later weeks. DO NOT put introductory topics in later weeks.\n");
        prompt.append("3. Strict Week Calculation: `weekNumber` MUST strictly equal `Math.ceil(dayNumber / 7.0)`. (e.g. Days 1-7 = Week 1, Days 8-14 = Week 2).\n");
        prompt.append("4. Array Ordering: The JSON array MUST be sorted strictly chronologically. Day 1 first, up to Day ").append(plan.getDurationDays()).append(".\n");
        prompt.append("5. `orderIndex` MUST strictly increment sequentially from 0, 1, 2, 3... corresponding exactly to the task's chronological order in the array.\n");
        prompt.append("6. Create 1-2 highly detailed, actionable tasks per DAY with NO placeholders (e.g., do not combine 'Days 4-10').\n");
        prompt.append("7. Ensure each task has a realistic `estimatedHours` based on the user's focus time.\n\n");

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
        prompt.append("    \"assignedToId\": \"User ID (Optional, use from teamMembers list)\",\n");
        prompt.append("    \"parentTaskId\": null,\n");
        prompt.append("    \"orderIndex\": 0\n");
        prompt.append("  }\n");
        prompt.append("]\n");

        return prompt.toString();
    }

    public String buildChatPrompt(String message, List<AIContextMessage> history,
                                  Map<String, Object> context,
                                  Map<String, Object> additionalContext) {
        StringBuilder prompt = new StringBuilder();

        prompt.append("60-day learning journey. You have context about their learning style ");
        prompt.append("and progress. Provide helpful, encouraging, and actionable responses.\n\n");

        prompt.append("## AUTOMATED ACTIONS (COMMANDS)\n");
        prompt.append("You can perform automated actions by including these commands in your response. Only use them when clear user intent is present.\n");
        prompt.append("Format: `ACTION: NAME(params)`\n");
        prompt.append("- `ACTION: CREATE_PROJECT('Project Name')` - Create a new project in the workspace.\n");
        prompt.append("- `ACTION: CREATE_GOAL('Goal Title', targetValue, 'Unit', 'MONTHLY|WEEKLY')` - Create a new quantifiable goal.\n");
        prompt.append("- `ACTION: SET_REMINDER('Title', taskId, minutesLeadTime)` - Set a reminder for a task.\n");
        prompt.append("- `ACTION: SCHEDULE_TIME_BLOCK('Title', 'startTimeISO', 'endTimeISO')` - Schedule focus time.\n");
        prompt.append("- `ACTION: ASSIGN_TASK(taskId, userId)` - Assign an existing task to a team member.\n\n");

        if (history != null && !history.isEmpty()) {
            prompt.append("## CONVERSATION HISTORY\n");
            // Take the last 10 messages to ensure current context is preserved
            int start = Math.max(0, history.size() - 10);
            for (int i = start; i < history.size(); i++) {
                AIContextMessage msg = history.get(i);
                prompt.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
            }
            prompt.append("\n");
        }

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
        prompt.append("1. Be encouraging, professional, and supportive (ChatGPT-like persona).\n");
        prompt.append("2. Provide specific, actionable advice for productivity and learning.\n");
        prompt.append("3. Reference their learning style, progress, and team members when relevant.\n");
        prompt.append("4. Suggest improvements, assignments, or adjustments if needed.\n");
        prompt.append("5. You can propose actions by including them at the end of your response in the format: ACTION: [ACTION_NAME](params). Supported actions:\n");
        prompt.append("   - ASSIGN_TASK(taskId, userId): Assign an existing task to a team member.\n");
        prompt.append("   - CREATE_PROJECT(name): Create a new workspace project.\n");
        prompt.append("   - CREATE_GOAL(title, target, unit, type): Create a new goal (e.g. 'Read 5 books', target=5, unit='books', type='monthly').\n");
        prompt.append("   - SET_REMINDER(title, todoId, leadTime): Set a reminder for a task.\n");
        prompt.append("   - SCHEDULE_TIME_BLOCK(title, startTime, endTime): Schedule a focus block.\n");
        prompt.append("   - REORGANIZE_PLAN(): Trigger a plan re-optimization.\n");
        prompt.append("6. If the user asks you to 'assign' something, suggest the best teammate based on the context.\n");
        prompt.append("7. Keep responses focused on their learning journey and workspace efficiency.\n");

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

    public String buildWorkloadAnalysisPrompt(List<com.loki.todo.model.Todos> activeTasks, String userName) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an AI assistant analyzing a user's workload.\n");
        prompt.append("User: ").append(userName).append("\n");
        prompt.append("Number of active tasks: ").append(activeTasks.size()).append("\n\n");
        prompt.append("Provide a brief, encouraging summary of their current workload.\n");
        return prompt.toString();
    }
}