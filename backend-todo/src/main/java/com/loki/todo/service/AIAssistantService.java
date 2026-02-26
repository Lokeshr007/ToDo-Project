// BACKEND-TODO/SRC/main/java/com/loki/todo/service/AIAssistantService.java
package com.loki.todo.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.loki.todo.dto.*;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import com.loki.todo.util.FileTextExtractor;
import com.loki.todo.util.OpenAIClient;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class AIAssistantService {

    private final FileTextExtractor fileTextExtractor;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;
    private final AIPlanRepository aiPlanRepository;
    private final AIGeneratedTaskRepository aiTaskRepository;
    private final TodosRepository todosRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    // Constructor
    public AIAssistantService(
            FileTextExtractor fileTextExtractor,
            OpenAIClient openAIClient,
            AIPlanRepository aiPlanRepository,
            AIGeneratedTaskRepository aiTaskRepository,
            TodosRepository todosRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository) {

        this.fileTextExtractor = fileTextExtractor;
        this.openAIClient = openAIClient;
        this.aiPlanRepository = aiPlanRepository;
        this.aiTaskRepository = aiTaskRepository;
        this.todosRepository = todosRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;

        // Initialize ObjectMapper
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
    }

    @Transactional
    public AIPlanResponseDTO parsePlan(MultipartFile file, User user) {
        try {
            // Extract text from file
            String extractedText = fileTextExtractor.extractText(file);

            // Create prompt for AI
            String prompt = createPlanParsingPrompt(extractedText);

            // Call OpenAI
            String aiResponse = openAIClient.sendMessage(prompt);

            // Parse AI response into structured plan
            AIPlanResponseDTO planResponse = parseAIResponseToPlan(aiResponse);

            // Save plan to database
            AIPlan aiPlan = new AIPlan();
            aiPlan.setTitle(planResponse.getTitle());
            aiPlan.setDurationDays(planResponse.getDuration());
            aiPlan.setSourceFileName(file.getOriginalFilename());
            aiPlan.setRawContent(extractedText.length() > 5000 ? extractedText.substring(0, 5000) : extractedText);
            aiPlan.setParsedPlanJson(aiResponse);
            aiPlan.setUser(user);
            aiPlan.setCreatedAt(LocalDateTime.now());

            AIPlan savedPlan = aiPlanRepository.save(aiPlan);
            planResponse.setId(savedPlan.getId());

            log.info("Study plan parsed and saved: {} for user: {}", savedPlan.getId(), user.getEmail());

            return planResponse;

        } catch (Exception e) {
            log.error("Failed to parse plan", e);
            throw new RuntimeException("Failed to parse study plan: " + e.getMessage());
        }
    }

    @Transactional
    public List<TodoDTO> generateTasksFromPlan(Object planObj, User user) {
        try {
            AIPlanDTO planDTO = null;

            // Convert the plan object to AIPlanDTO
            if (planObj instanceof Map) {
                planDTO = objectMapper.convertValue(planObj, AIPlanDTO.class);
            } else if (planObj instanceof AIPlanDTO) {
                planDTO = (AIPlanDTO) planObj;
            } else {
                planDTO = new AIPlanDTO();
                planDTO.setTitle("Study Plan");
                planDTO.setDuration(60);
                planDTO.setSubjects(List.of("General Study"));
            }

            String prompt = createTaskGenerationPrompt(planDTO);
            String aiResponse = openAIClient.sendMessage(prompt);

            List<TodoDTO> tasks = parseTasksFromAIResponse(aiResponse);

            log.info("Generated {} tasks from plan for user: {}", tasks.size(), user.getEmail());

            return tasks;

        } catch (Exception e) {
            log.error("Failed to generate tasks", e);
            throw new RuntimeException("Failed to generate tasks: " + e.getMessage());
        }
    }

    public String processChat(Map<String, Object> message, User user) {
        try {
            String content = message.get("message") != null ?
                    message.get("message").toString() : "";
            Object context = message.get("context");

            String prompt = String.format("""
                You are an AI study plan assistant helping a user with their 60-day learning journey.
                
                Current context: %s
                
                User's message: %s
                
                Provide helpful, actionable advice about their study plan. 
                Suggest improvements, answer questions about study techniques, 
                and help them stay motivated and organized.
                """,
                    context != null ? context.toString() : "No specific context",
                    content
            );

            return openAIClient.sendMessage(prompt);

        } catch (Exception e) {
            log.error("Failed to process chat", e);
            return "I'm having trouble responding right now. Please try again later.";
        }
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private String createPlanParsingPrompt(String text) {
        return String.format("""
            You are an AI assistant specialized in creating structured 60-day study plans.
            
            Analyze the following study plan document and extract key information.
            The document may contain topics, daily goals, milestones, and study schedules.
            
            Document content:
            %s
            
            Return a JSON object with this exact structure:
            {
                "title": "Main title of the study plan",
                "duration": 60,
                "subjects": ["Subject 1", "Subject 2", "Subject 3"],
                "dailyGoals": [
                    {
                        "day": 1,
                        "topics": ["Topic 1", "Topic 2"],
                        "hours": 2,
                        "tasks": ["Read chapter 1", "Complete exercise 1"]
                    }
                ],
                "milestones": [
                    {
                        "day": 30,
                        "description": "Complete first half of material"
                    }
                ],
                "recommendedHoursPerDay": 4,
                "prerequisites": ["Basic knowledge of X", "Software Y installed"]
            }
            
            If information is not available in the document, make reasonable assumptions
            based on standard study plans. Ensure all 60 days are covered in dailyGoals.
            """, text.length() > 3000 ? text.substring(0, 3000) + "..." : text);
    }

    private String createTaskGenerationPrompt(AIPlanDTO plan) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Create detailed, actionable daily todo tasks for a 60-day study plan.\n\n");
        prompt.append("Plan Details:\n");
        prompt.append("- Title: ").append(plan.getTitle() != null ? plan.getTitle() : "Study Plan").append("\n");
        prompt.append("- Subjects: ").append(plan.getSubjects() != null ? String.join(", ", plan.getSubjects()) : "General").append("\n");
        prompt.append("- Duration: 60 days\n\n");

        prompt.append("For each day, create 3-5 specific tasks that include:\n");
        prompt.append("- Reading assignments with page numbers\n");
        prompt.append("- Practice exercises with specific objectives\n");
        prompt.append("- Review of previous material\n");
        prompt.append("- Small projects or applications\n\n");

        prompt.append("Return a JSON array with this exact structure:\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"day\": 1,\n");
        prompt.append("    \"title\": \"Clear, actionable task title\",\n");
        prompt.append("    \"description\": \"Detailed description of what to do\",\n");
        prompt.append("    \"priority\": \"HIGH/MEDIUM/LOW\",\n");
        prompt.append("    \"estimatedHours\": 1.5,\n");
        prompt.append("    \"subject\": \"Subject name\",\n");
        prompt.append("    \"tags\": [\"reading\", \"practice\"]\n");
        prompt.append("  }\n");
        prompt.append("]\n\n");

        prompt.append("Base the tasks on the daily goals structure. ");
        prompt.append("Ensure tasks are progressive and build upon each other. ");
        prompt.append("Include mix of theory and practice.");

        return prompt.toString();
    }

    private AIPlanResponseDTO parseAIResponseToPlan(String aiResponse) {
        try {
            // Clean response (remove markdown code blocks if present)
            String cleanedResponse = aiResponse.replaceAll("```json\\s*", "")
                    .replaceAll("```\\s*", "")
                    .trim();

            return objectMapper.readValue(cleanedResponse, AIPlanResponseDTO.class);
        } catch (Exception e) {
            log.error("Failed to parse AI response to plan", e);

            // Return a default plan if parsing fails
            AIPlanResponseDTO defaultPlan = new AIPlanResponseDTO();
            defaultPlan.setTitle("Study Plan");
            defaultPlan.setDuration(60);
            defaultPlan.setSubjects(List.of("General Study"));
            defaultPlan.setDailyGoals(createDefaultDailyGoals());
            defaultPlan.setMilestones(createDefaultMilestones());
            defaultPlan.setRecommendedHoursPerDay(4);
            defaultPlan.setPrerequisites(List.of("None"));

            return defaultPlan;
        }
    }

    private List<TodoDTO> parseTasksFromAIResponse(String aiResponse) {
        try {
            // Clean response (remove markdown code blocks if present)
            String cleanedResponse = aiResponse.replaceAll("```json\\s*", "")
                    .replaceAll("```\\s*", "")
                    .trim();

            JsonNode tasksNode = objectMapper.readTree(cleanedResponse);
            List<TodoDTO> tasks = new ArrayList<>();

            if (tasksNode.isArray()) {
                for (JsonNode taskNode : tasksNode) {
                    TodoDTO task = new TodoDTO();

                    // Day
                    task.setDay(taskNode.has("day") ? taskNode.get("day").asInt() : 1);

                    // Title
                    task.setTitle(taskNode.has("title") ? taskNode.get("title").asText() : "Study task");

                    // Description
                    task.setDescription(taskNode.has("description") ?
                            taskNode.get("description").asText() : "");

                    // Priority
                    task.setPriority(taskNode.has("priority") ?
                            taskNode.get("priority").asText().toUpperCase() : "MEDIUM");

                    // Estimated Hours
                    task.setEstimatedHours(taskNode.has("estimatedHours") ?
                            taskNode.get("estimatedHours").asDouble() : 1.0);

                    // Subject
                    task.setSubject(taskNode.has("subject") ?
                            taskNode.get("subject").asText() : "General");

                    // Tags
                    if (taskNode.has("tags") && taskNode.get("tags").isArray()) {
                        List<String> tags = new ArrayList<>();
                        for (JsonNode tagNode : taskNode.get("tags")) {
                            tags.add(tagNode.asText());
                        }
                        task.setTags(tags);
                    }

                    tasks.add(task);
                }
            }

            // If no tasks were parsed, create default ones
            if (tasks.isEmpty()) {
                tasks = createDefaultTasks();
            }

            return tasks;

        } catch (Exception e) {
            log.error("Failed to parse tasks from AI response", e);
            return createDefaultTasks();
        }
    }

    private List<AIPlanDailyGoalDTO> createDefaultDailyGoals() {
        List<AIPlanDailyGoalDTO> goals = new ArrayList<>();

        for (int day = 1; day <= 60; day++) {
            AIPlanDailyGoalDTO goal = new AIPlanDailyGoalDTO();
            goal.setDay(day);
            goal.setTopics(List.of("Study topic " + ((day % 7) + 1)));
            goal.setHours(2);
            goal.setTasks(List.of("Study for 2 hours", "Take notes", "Review previous day"));
            goals.add(goal);
        }

        return goals;
    }

    private List<AIPlanMilestoneDTO> createDefaultMilestones() {
        List<AIPlanMilestoneDTO> milestones = new ArrayList<>();
        milestones.add(new AIPlanMilestoneDTO(15, "Complete first quarter"));
        milestones.add(new AIPlanMilestoneDTO(30, "Halfway point - Review all material"));
        milestones.add(new AIPlanMilestoneDTO(45, "Three quarters complete"));
        milestones.add(new AIPlanMilestoneDTO(60, "Final review and completion"));
        return milestones;
    }

    private List<TodoDTO> createDefaultTasks() {
        List<TodoDTO> tasks = new ArrayList<>();

        for (int day = 1; day <= 60; day++) {
            TodoDTO task = new TodoDTO();
            task.setDay(day);
            task.setTitle("Day " + day + " - Study Session");
            task.setDescription("Complete today's study activities");
            task.setPriority("MEDIUM");
            task.setEstimatedHours(2.0);
            task.setSubject("General");
            task.setTags(List.of("daily", "study"));
            tasks.add(task);
        }

        return tasks;
    }
}