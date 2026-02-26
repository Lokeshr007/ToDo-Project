package com.loki.todo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.loki.todo.dto.*;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import com.loki.todo.util.*;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
public class EnterpriseAIService {

    private final AdvancedFileParser advancedFileParser;
    private final AIPromptBuilder promptBuilder;
    private final AIResponseParser responseParser;
    private final ContextManager contextManager;
    private final OpenAIClient openAIClient;
    private final ObjectMapper objectMapper;

    private final EnhancedAIPlanRepository planRepository;
    private final EnhancedAITaskRepository taskRepository;
    private final AIContextRepository contextRepository;
    private final AIProjectStructureRepository projectStructureRepository;

    private final ProjectService projectService;
    private final BoardService boardService;
    private final TodosService todosService;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;

    @Transactional
    public EnterpriseAIResponseDTO processRequest(EnterpriseAIRequestDTO request, User user) {
        String action = request.getAction();

        // Get or create context
        AIContext context = getOrCreateContext(request, user);

        switch (action) {
            case "PARSE_PLAN":
                return parsePlan(request, user, context);
            case "GENERATE_TASKS":
                return generateTasks(request, user, context);
            case "CHAT":
                return processChat(request, user, context);
            case "REFINE":
                return refinePlan(request, user, context);
            default:
                throw new RuntimeException("Unknown action: " + action);
        }
    }

    private EnterpriseAIResponseDTO parsePlan(EnterpriseAIRequestDTO request, User user, AIContext context) {
        try {
            MultipartFile file = request.getFile();
            if (file == null && request.getFileContent() == null) {
                throw new RuntimeException("No file or content provided");
            }

            // Extract text from file
            String extractedText;
            String fileType;
            String fileName;

            if (file != null) {
                extractedText = advancedFileParser.extractText(file);
                fileType = advancedFileParser.getFileType(file);
                fileName = file.getOriginalFilename();
            } else {
                extractedText = request.getFileContent();
                fileType = request.getFileType();
                fileName = "content.txt";
            }

            // Analyze document structure
            Map<String, Object> documentAnalysis = advancedFileParser.analyzeDocument(extractedText, fileType);

            // Build AI prompt
            String prompt = promptBuilder.buildPlanParsingPrompt(
                    extractedText,
                    documentAnalysis,
                    context,
                    request.getUserPreferences()
            );

            // Call AI
            String aiResponse = openAIClient.sendMessage(prompt);

            // Parse AI response
            EnhancedAIPlanDTO planDTO = responseParser.parsePlanResponse(aiResponse);

            // Create and save plan
            EnhancedAIPlan plan = new EnhancedAIPlan();
            plan.setTitle(planDTO.getTitle());
            plan.setDescription(planDTO.getDescription());
            plan.setDurationDays(planDTO.getDurationDays());
            plan.setSourceFileName(fileName);
            plan.setSourceFileType(fileType);
            plan.setRawContent(extractedText.length() > 20000 ? extractedText.substring(0, 20000) : extractedText);
            plan.setParsedPlanJson(aiResponse);
            plan.setSummary(planDTO.getSummary());
            plan.setDifficulty(planDTO.getDifficulty());
            plan.setCategory(planDTO.getCategory());
            plan.setEstimatedTotalHours(planDTO.getEstimatedTotalHours());
            plan.setRecommendedDailyHours(planDTO.getRecommendedDailyHours());
            plan.setConfidenceScore(planDTO.getConfidenceScore());
            plan.setUser(user);

            if (request.getWorkspaceId() != null) {
                workspaceRepository.findById(request.getWorkspaceId())
                        .ifPresent(plan::setWorkspace);
            }

            EnhancedAIPlan savedPlan = planRepository.save(plan);

            // Generate tasks if requested
            List<EnhancedAITaskDTO> tasks = null;
            AIProjectStructureDTO projectStructureDTO = null;

            if (request.getCreateProject() != null && request.getCreateProject()) {
                tasks = generateTasksFromPlan(savedPlan, user, context);

                // Create project structure and convert to DTO
                AIProjectStructure projectStructure = createProjectStructure(savedPlan, tasks, user, request.getWorkspaceId());
                if (projectStructure != null) {
                    projectStructureDTO = convertToProjectStructureDTO(projectStructure);
                }
            }

            // Update context
            context.setCurrentPlan(savedPlan);
            context.setInteractionCount(context.getInteractionCount() + 1);
            context.setLastInteraction(LocalDateTime.now());
            contextRepository.save(context);

            // Build response
            EnterpriseAIResponseDTO response = new EnterpriseAIResponseDTO();
            response.setId(savedPlan.getId().toString());
            response.setSessionId(context.getSessionId());
            response.setAction("PARSE_PLAN");
            response.setSuccess(true);
            response.setPlan(planDTO);
            response.setTasks(tasks);
            response.setProjectStructure(projectStructureDTO);
            response.setSummary(planDTO.getSummary());
            response.setConfidenceScore(planDTO.getConfidenceScore());
            response.setTotalTasks(tasks != null ? tasks.size() : 0);
            response.setTotalHours(planDTO.getEstimatedTotalHours());
            response.setEstimatedDays(planDTO.getDurationDays());

            // Generate insights
            response.setInsights(generateInsights(savedPlan, tasks));
            response.setSuggestions(generateSuggestions(savedPlan, tasks));

            return response;

        } catch (Exception e) {
            log.error("Failed to parse plan", e);
            throw new RuntimeException("Failed to parse plan: " + e.getMessage());
        }
    }

    private EnterpriseAIResponseDTO generateTasks(EnterpriseAIRequestDTO request, User user, AIContext context) {
        try {
            EnhancedAIPlan plan = planRepository.findByIdAndUser(request.getPlanId(), user)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));

            List<EnhancedAITaskDTO> tasks = generateTasksFromPlan(plan, user, context);

            AIProjectStructureDTO projectStructureDTO = null;
            if (request.getCreateProject() != null && request.getCreateProject() && request.getWorkspaceId() != null) {
                AIProjectStructure projectStructure = createProjectStructure(plan, tasks, user, request.getWorkspaceId());
                if (projectStructure != null) {
                    projectStructureDTO = convertToProjectStructureDTO(projectStructure);
                }
            }

            // Update context
            context.setCurrentPlan(plan);
            context.setInteractionCount(context.getInteractionCount() + 1);
            context.setLastInteraction(LocalDateTime.now());
            contextRepository.save(context);

            EnterpriseAIResponseDTO response = new EnterpriseAIResponseDTO();
            response.setId(plan.getId().toString());
            response.setSessionId(context.getSessionId());
            response.setAction("GENERATE_TASKS");
            response.setSuccess(true);
            response.setTasks(tasks);
            response.setProjectStructure(projectStructureDTO);
            response.setTotalTasks(tasks.size());
            response.setTotalHours(plan.getEstimatedTotalHours());
            response.setEstimatedDays(plan.getDurationDays());

            return response;

        } catch (Exception e) {
            log.error("Failed to generate tasks", e);
            throw new RuntimeException("Failed to generate tasks: " + e.getMessage());
        }
    }

    private EnterpriseAIResponseDTO processChat(EnterpriseAIRequestDTO request, User user, AIContext context) {
        try {
            // Get current context
            Map<String, Object> contextData = new HashMap<>();
            contextData.put("learningStyle", context.getLearningStyle());
            contextData.put("attentionSpan", context.getAttentionSpan());
            contextData.put("progressRate", context.getProgressRate());
            contextData.put("strengths", context.getStrengths());
            contextData.put("weaknesses", context.getWeaknesses());

            if (context.getCurrentPlan() != null) {
                contextData.put("currentPlan", context.getCurrentPlan().getTitle());
                contextData.put("planProgress", context.getProgressRate());
            }

            // Build chat prompt
            String prompt = promptBuilder.buildChatPrompt(
                    request.getMessage(),
                    contextData,
                    request.getContext() != null ? request.getContext() : new HashMap<>()
            );

            // Call AI
            String aiResponse = openAIClient.sendMessage(prompt);

            // Update context
            context.setInteractionCount(context.getInteractionCount() + 1);
            context.setLastInteraction(LocalDateTime.now());
            contextRepository.save(context);

            EnterpriseAIResponseDTO response = new EnterpriseAIResponseDTO();
            response.setSessionId(context.getSessionId());
            response.setAction("CHAT");
            response.setSuccess(true);
            response.setMessage(aiResponse);

            return response;

        } catch (Exception e) {
            log.error("Failed to process chat", e);
            throw new RuntimeException("Failed to process chat: " + e.getMessage());
        }
    }

    private EnterpriseAIResponseDTO refinePlan(EnterpriseAIRequestDTO request, User user, AIContext context) {
        try {
            EnhancedAIPlan plan = planRepository.findByIdAndUser(request.getPlanId(), user)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));

            // Get current tasks
            List<EnhancedAITask> currentTasks = taskRepository.findByPlan(plan);

            // Build refinement prompt
            String prompt = promptBuilder.buildRefinementPrompt(
                    plan,
                    currentTasks,
                    request.getMessage(),
                    context
            );

            // Call AI
            String aiResponse = openAIClient.sendMessage(prompt);

            // Parse refined tasks
            List<EnhancedAITaskDTO> refinedTasks = responseParser.parseTasksResponse(aiResponse);

            // Update tasks
            List<EnhancedAITask> updatedTasks = new ArrayList<>();
            for (EnhancedAITaskDTO taskDTO : refinedTasks) {
                Optional<EnhancedAITask> existingTask = currentTasks.stream()
                        .filter(t -> t.getDayNumber() != null && taskDTO.getDayNumber() != null &&
                                t.getDayNumber().equals(taskDTO.getDayNumber()) &&
                                t.getTitle().equals(taskDTO.getTitle()))
                        .findFirst();

                EnhancedAITask task;
                if (existingTask.isPresent()) {
                    task = existingTask.get();
                } else {
                    task = new EnhancedAITask();
                    task.setPlan(plan);
                }

                updateTaskFromDTO(task, taskDTO);
                updatedTasks.add(taskRepository.save(task));
            }

            // Update context
            context.setInteractionCount(context.getInteractionCount() + 1);
            context.setLastInteraction(LocalDateTime.now());
            contextRepository.save(context);

            EnterpriseAIResponseDTO response = new EnterpriseAIResponseDTO();
            response.setId(plan.getId().toString());
            response.setSessionId(context.getSessionId());
            response.setAction("REFINE");
            response.setSuccess(true);
            response.setTasks(refinedTasks);
            response.setTotalTasks(refinedTasks.size());

            return response;

        } catch (Exception e) {
            log.error("Failed to refine plan", e);
            throw new RuntimeException("Failed to refine plan: " + e.getMessage());
        }
    }

    private List<EnhancedAITaskDTO> generateTasksFromPlan(EnhancedAIPlan plan, User user, AIContext context) {
        try {
            // Build task generation prompt
            String prompt = promptBuilder.buildTaskGenerationPrompt(plan, context);

            // Call AI
            String aiResponse = openAIClient.sendMessage(prompt);

            // Parse tasks
            List<EnhancedAITaskDTO> taskDTOs = responseParser.parseTasksResponse(aiResponse);

            // Save tasks
            List<EnhancedAITask> savedTasks = new ArrayList<>();
            for (EnhancedAITaskDTO taskDTO : taskDTOs) {
                EnhancedAITask task = new EnhancedAITask();
                task.setPlan(plan);
                task.setTitle(taskDTO.getTitle());
                task.setDescription(taskDTO.getDescription());
                task.setDayNumber(taskDTO.getDayNumber());
                task.setWeekNumber(taskDTO.getWeekNumber());
                task.setPriority(taskDTO.getPriority());
                task.setEstimatedHours(taskDTO.getEstimatedHours());
                task.setCategory(taskDTO.getCategory());
                task.setSubCategory(taskDTO.getSubCategory());
                task.setTags(taskDTO.getTags() != null ? taskDTO.getTags() : new ArrayList<>());
                task.setPrerequisites(taskDTO.getPrerequisites() != null ? taskDTO.getPrerequisites() : new ArrayList<>());
                task.setResourceLinks(taskDTO.getResourceLinks());
                task.setDeliverables(taskDTO.getDeliverables());
                task.setParentTaskId(taskDTO.getParentTaskId());
                task.setOrderIndex(taskDTO.getOrderIndex() != null ? taskDTO.getOrderIndex() : 0);

                // Calculate suggested dates
                if (taskDTO.getDayNumber() != null) {
                    LocalDate startDate = LocalDate.now().plusDays(taskDTO.getDayNumber() - 1);
                    task.setSuggestedStartDate(startDate);
                    task.setSuggestedDueDate(startDate.plusDays(1));
                }

                savedTasks.add(taskRepository.save(task));
            }

            return savedTasks.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to generate tasks from plan", e);
            throw new RuntimeException("Failed to generate tasks: " + e.getMessage());
        }
    }


    private AIProjectStructure createProjectStructure(EnhancedAIPlan plan, List<EnhancedAITaskDTO> tasks,
                                                      User user, Long workspaceId) {
        try {
            // Create project
            String projectName = plan.getTitle() + " - 60 Day Plan";
            Project project = projectService.createProject(
                    workspaceId,
                    projectName,
                    plan.getSummary() != null ? plan.getSummary() : "Learning plan generated by AI",
                    generateProjectColor(),
                    user.getEmail()
            );

            // Create boards based on weeks
            Map<Integer, List<EnhancedAITaskDTO>> tasksByWeek = tasks.stream()
                    .filter(t -> t.getWeekNumber() != null)
                    .collect(Collectors.groupingBy(EnhancedAITaskDTO::getWeekNumber));

            AIProjectStructure projectStructure = new AIProjectStructure();
            projectStructure.setProjectName(projectName);
            projectStructure.setProjectDescription(plan.getSummary() != null ? plan.getSummary() : "");
            projectStructure.setProjectColor(generateProjectColor());
            projectStructure.setCreatedProjectId(project.getId());
            projectStructure.setPlan(plan);

            List<AIBoardStructure> boardStructures = new ArrayList<>();

            // Create boards for each week
            for (Map.Entry<Integer, List<EnhancedAITaskDTO>> entry : tasksByWeek.entrySet()) {
                Integer week = entry.getKey();
                List<EnhancedAITaskDTO> weekTasks = entry.getValue();

                // Create board using correct parameters
                String boardName = "Week " + week + ": " + getWeekTheme(weekTasks);
                Board board = boardService.createBoard(
                        project.getId(),
                        boardName,
                        "Tasks for week " + week + " of your 60-day plan",
                        generateWeekColor(week),
                        user.getEmail()
                );

                AIBoardStructure boardStructure = new AIBoardStructure();
                boardStructure.setBoardName(boardName);
                boardStructure.setBoardDescription(board.getDescription());
                boardStructure.setBoardColor(board.getColor());
                boardStructure.setOrderIndex(week);
                boardStructure.setCreatedBoardId(board.getId());
                boardStructure.setProjectStructure(projectStructure);

                // Get columns from the board
                List<BoardColumn> columns = board.getColumns();

                List<AIColumnStructure> columnStructures = new ArrayList<>();
                for (BoardColumn column : columns) {
                    AIColumnStructure columnStructure = new AIColumnStructure();
                    columnStructure.setColumnName(column.getName());
                    columnStructure.setColumnType(column.getType().name());
                    columnStructure.setColumnColor(column.getColor());
                    columnStructure.setOrderIndex((int) column.getOrderIndex());
                    columnStructure.setWipLimit(column.getWipLimit());
                    columnStructure.setCreatedColumnId(column.getId());
                    columnStructure.setBoardStructure(boardStructure);
                    columnStructures.add(columnStructure);
                }

                boardStructure.setColumns(columnStructures);
                boardStructures.add(boardStructure);

                // Create todos from tasks
                createTodosFromTasks(board, weekTasks, user);
            }

            projectStructure.setBoards(boardStructures);
            return projectStructureRepository.save(projectStructure);

        } catch (Exception e) {
            log.error("Failed to create project structure", e);
            throw new RuntimeException("Failed to create project structure: " + e.getMessage());
        }
    }

    private void createTodosFromTasks(Board board, List<EnhancedAITaskDTO> tasks, User user) {
        try {
            for (EnhancedAITaskDTO taskDTO : tasks) {
                TodoRequest request = new TodoRequest();
                request.setItem(taskDTO.getTitle());
                request.setDescription(taskDTO.getDescription());
                request.setPriority(taskDTO.getPriority());
                request.setDueDate(taskDTO.getSuggestedDueDate());
                request.setBoardId(board.getId());

                // Add to first column by default
                if (board.getColumns() != null && !board.getColumns().isEmpty()) {
                    request.setColumnId(board.getColumns().get(0).getId());
                }

                // Add labels
                if (taskDTO.getTags() != null && !taskDTO.getTags().isEmpty()) {
                    request.setLabels(taskDTO.getTags().toArray(new String[0]));
                }

                todosService.addTask(request, user.getEmail());
            }
        } catch (Exception e) {
            log.error("Failed to create todos from tasks", e);
        }
    }

    private AIContext getOrCreateContext(EnterpriseAIRequestDTO request, User user) {
        String sessionId = request.getSessionId();
        if (sessionId != null) {
            return contextRepository.findBySessionIdAndUser(sessionId, user)
                    .orElseGet(() -> createNewContext(request, user));
        }
        return createNewContext(request, user);
    }

    private AIContext createNewContext(EnterpriseAIRequestDTO request, User user) {
        AIContext context = new AIContext();
        context.setSessionId(UUID.randomUUID().toString());
        context.setUser(user);
        context.setLearningStyle(request.getLearningStyle() != null ?
                request.getLearningStyle() : "READING");
        context.setAttentionSpan(request.getAttentionSpan() != null ?
                request.getAttentionSpan() : 60);
        context.setStrengths(new ArrayList<>());
        context.setWeaknesses(new ArrayList<>());
        context.setProgressRate(0.0);
        context.setInteractionCount(0);
        context.setLastInteraction(LocalDateTime.now());

        if (request.getUserPreferences() != null) {
            try {
                context.setUserPreferences(objectMapper.writeValueAsString(request.getUserPreferences()));
            } catch (Exception e) {
                log.error("Failed to save user preferences", e);
            }
        }

        return contextRepository.save(context);
    }

    private Map<String, Object> generateInsights(EnhancedAIPlan plan, List<EnhancedAITaskDTO> tasks) {
        Map<String, Object> insights = new HashMap<>();

        if (tasks == null || tasks.isEmpty()) {
            return insights;
        }

        // Task distribution
        Map<String, Long> priorityDistribution = tasks.stream()
                .filter(t -> t.getPriority() != null)
                .collect(Collectors.groupingBy(EnhancedAITaskDTO::getPriority, Collectors.counting()));
        insights.put("priorityDistribution", priorityDistribution);

        // Weekly workload
        Map<Integer, Double> weeklyHours = tasks.stream()
                .filter(t -> t.getWeekNumber() != null && t.getEstimatedHours() != null)
                .collect(Collectors.groupingBy(
                        EnhancedAITaskDTO::getWeekNumber,
                        Collectors.summingDouble(EnhancedAITaskDTO::getEstimatedHours)
                ));
        insights.put("weeklyHours", weeklyHours);

        // Most productive days
        Map<Integer, Long> tasksPerDay = tasks.stream()
                .filter(t -> t.getDayNumber() != null)
                .collect(Collectors.groupingBy(EnhancedAITaskDTO::getDayNumber, Collectors.counting()));

        Optional<Map.Entry<Integer, Long>> maxDay = tasksPerDay.entrySet().stream()
                .max(Map.Entry.comparingByValue());
        maxDay.ifPresent(entry -> insights.put("busiestDay", entry.getKey()));

        // Category breakdown
        Map<String, Long> categoryDistribution = tasks.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(EnhancedAITaskDTO::getCategory, Collectors.counting()));
        insights.put("categories", categoryDistribution);

        // Total effort
        double totalHours = tasks.stream()
                .mapToDouble(t -> t.getEstimatedHours() != null ? t.getEstimatedHours() : 0)
                .sum();
        insights.put("totalEffortHours", totalHours);
        insights.put("averageDailyHours", tasks.size() > 0 ? totalHours / tasks.size() : 0);

        return insights;
    }

    private List<String> generateSuggestions(EnhancedAIPlan plan, List<EnhancedAITaskDTO> tasks) {
        List<String> suggestions = new ArrayList<>();

        if (tasks == null || tasks.isEmpty()) {
            suggestions.add("Generate tasks to start your learning journey");
            return suggestions;
        }

        // Check workload balance
        Map<Integer, Double> weeklyHours = tasks.stream()
                .filter(t -> t.getWeekNumber() != null && t.getEstimatedHours() != null)
                .collect(Collectors.groupingBy(
                        EnhancedAITaskDTO::getWeekNumber,
                        Collectors.summingDouble(EnhancedAITaskDTO::getEstimatedHours)
                ));

        weeklyHours.forEach((week, hours) -> {
            if (hours > 20) {
                suggestions.add("Week " + week + " has a heavy workload (" + hours.intValue() + " hours). Consider spreading tasks more evenly.");
            } else if (hours < 5) {
                suggestions.add("Week " + week + " seems light. You might add more tasks to maintain momentum.");
            }
        });

        // Check prerequisites
        Set<String> allPrereqs = tasks.stream()
                .filter(t -> t.getPrerequisites() != null)
                .flatMap(t -> t.getPrerequisites().stream())
                .collect(Collectors.toSet());

        if (!allPrereqs.isEmpty()) {
            suggestions.add("Complete prerequisite topics: " +
                    String.join(", ", allPrereqs.stream().limit(3).collect(Collectors.toList())));
        }

        // Learning style suggestions
        if (plan.getDifficulty() != null) {
            switch (plan.getDifficulty()) {
                case "BEGINNER":
                    suggestions.add("Start with fundamentals and take breaks every 45 minutes");
                    break;
                case "INTERMEDIATE":
                    suggestions.add("Mix theory with practical exercises for better retention");
                    break;
                case "ADVANCED":
                    suggestions.add("Focus on project-based learning to apply advanced concepts");
                    break;
            }
        }

        // Progress tracking
        if (plan.getRecommendedDailyHours() != null) {
            suggestions.add("Aim for " + plan.getRecommendedDailyHours().intValue() +
                    " hours daily to stay on track with your " + plan.getDurationDays() + "-day goal");
        }

        return suggestions;
    }

    private String generateProjectColor() {
        String[] colors = {"#6366f1", "#8b5cf6", "#d946ef", "#ec4899", "#f43f5e"};
        return colors[new Random().nextInt(colors.length)];
    }

    private String generateWeekColor(int week) {
        String[] colors = {"#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"};
        return colors[week % colors.length];
    }

    private String getWeekTheme(List<EnhancedAITaskDTO> tasks) {
        if (tasks.isEmpty()) return "Learning";

        Map<String, Long> categoryCount = tasks.stream()
                .filter(t -> t.getCategory() != null)
                .collect(Collectors.groupingBy(EnhancedAITaskDTO::getCategory, Collectors.counting()));

        return categoryCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Learning");
    }

    private void updateTaskFromDTO(EnhancedAITask task, EnhancedAITaskDTO dto) {
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setDayNumber(dto.getDayNumber());
        task.setWeekNumber(dto.getWeekNumber());
        task.setPriority(dto.getPriority());
        task.setEstimatedHours(dto.getEstimatedHours());
        task.setCategory(dto.getCategory());
        task.setSubCategory(dto.getSubCategory());
        task.setTags(dto.getTags() != null ? dto.getTags() : new ArrayList<>());
        task.setPrerequisites(dto.getPrerequisites() != null ? dto.getPrerequisites() : new ArrayList<>());
        task.setResourceLinks(dto.getResourceLinks());
        task.setDeliverables(dto.getDeliverables());
        task.setParentTaskId(dto.getParentTaskId());
        task.setOrderIndex(dto.getOrderIndex() != null ? dto.getOrderIndex() : 0);
    }

    private AIProjectStructureDTO convertToProjectStructureDTO(AIProjectStructure structure) {
        if (structure == null) return null;

        AIProjectStructureDTO dto = new AIProjectStructureDTO();
        dto.setProjectName(structure.getProjectName());
        dto.setProjectDescription(structure.getProjectDescription());
        dto.setProjectColor(structure.getProjectColor());
        dto.setCreatedProjectId(structure.getCreatedProjectId());

        List<AIBoardStructureDTO> boardDTOs = new ArrayList<>();
        if (structure.getBoards() != null) {
            for (AIBoardStructure board : structure.getBoards()) {
                AIBoardStructureDTO bdto = new AIBoardStructureDTO();
                bdto.setBoardName(board.getBoardName());
                bdto.setBoardDescription(board.getBoardDescription());
                bdto.setBoardColor(board.getBoardColor());
                bdto.setOrderIndex(board.getOrderIndex());
                bdto.setCreatedBoardId(board.getCreatedBoardId());

                List<AIColumnStructureDTO> columnDTOs = new ArrayList<>();
                if (board.getColumns() != null) {
                    for (AIColumnStructure column : board.getColumns()) {
                        AIColumnStructureDTO cdto = new AIColumnStructureDTO();
                        cdto.setColumnName(column.getColumnName());
                        cdto.setColumnType(column.getColumnType());
                        cdto.setColumnColor(column.getColumnColor());
                        cdto.setOrderIndex(column.getOrderIndex());
                        cdto.setWipLimit(column.getWipLimit());
                        cdto.setCreatedColumnId(column.getCreatedColumnId());
                        columnDTOs.add(cdto);
                    }
                }
                bdto.setColumns(columnDTOs);
                boardDTOs.add(bdto);
            }
        }
        dto.setBoards(boardDTOs);

        return dto;
    }

    private EnhancedAITaskDTO convertToDTO(EnhancedAITask task) {
        EnhancedAITaskDTO dto = new EnhancedAITaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setDayNumber(task.getDayNumber());
        dto.setWeekNumber(task.getWeekNumber());
        dto.setPriority(task.getPriority());
        dto.setEstimatedHours(task.getEstimatedHours());
        dto.setStatus(task.getStatus());
        dto.setCategory(task.getCategory());
        dto.setSubCategory(task.getSubCategory());
        dto.setTags(task.getTags());
        dto.setPrerequisites(task.getPrerequisites());
        dto.setResourceLinks(task.getResourceLinks());
        dto.setDeliverables(task.getDeliverables());
        dto.setParentTaskId(task.getParentTaskId());
        dto.setOrderIndex(task.getOrderIndex());
        dto.setAccepted(task.getAccepted());
        dto.setSuggestedStartDate(task.getSuggestedStartDate());
        dto.setSuggestedDueDate(task.getSuggestedDueDate());
        return dto;
    }

    public EnterpriseAIResponseDTO getContext(String sessionId, User user) {
        AIContext context = contextRepository.findBySessionIdAndUser(sessionId, user)
                .orElseThrow(() -> new RuntimeException("Context not found"));

        EnterpriseAIResponseDTO response = new EnterpriseAIResponseDTO();
        response.setSessionId(sessionId);
        response.setAction("GET_CONTEXT");
        response.setSuccess(true);

        // Build context data
        Map<String, Object> contextData = new HashMap<>();
        contextData.put("learningStyle", context.getLearningStyle());
        contextData.put("attentionSpan", context.getAttentionSpan());
        contextData.put("progressRate", context.getProgressRate());
        contextData.put("interactionCount", context.getInteractionCount());
        contextData.put("lastInteraction", context.getLastInteraction());

        if (context.getCurrentPlan() != null) {
            contextData.put("currentPlan", context.getCurrentPlan().getTitle());
        }

        response.setInsights(contextData);

        return response;
    }

    public void clearContext(String sessionId, User user) {
        contextRepository.deleteBySessionIdAndUser(sessionId, user);
    }
}