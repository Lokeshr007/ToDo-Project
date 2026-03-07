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
import java.util.regex.*;
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
    private final MembershipRepository membershipRepository;

    private final ProjectService projectService;
    private final BoardService boardService;
    private final TodosService todosService;
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final GoalService goalService;
    private final ReminderService reminderService;
    private final TimeBlockService timeBlockService;
    private final GoalRepository goalRepository;
    private final ProjectRepository projectRepository;
    private final TodosRepository todosRepository;
    private final BoardColumnRepository columnRepository;
    private final BoardRepository boardRepository;

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
            case "ACCEPT_TASKS":
                return handleAcceptTasks(request, user);
            case "ASSIGN_TASK":
                return handleAssignTask(request, user);
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
            if (request.getDurationDays() != null) {
                documentAnalysis.put("durationDays", request.getDurationDays());
            }

            // Build AI prompt
            String prompt;
            if (extractedText.contains("image-based or contains no selectable text")) {
                prompt = "The user uploaded a PDF that appears to be image-based or scanned (no selectable text). " +
                        "Please respond in a friendly way explaining that you can't read the curriculum directly from this specific file, " +
                        "but you can still generate a generic learning plan if they tell you the topic, or they can copy-paste the text instead. " +
                        "Return a valid JSON plan for 'General Learning' as a placeholder.";
            } else {
                prompt = promptBuilder.buildPlanParsingPrompt(
                    extractedText,
                    documentAnalysis,
                    context,
                    request.getUserPreferences()
                );
            }

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
            java.io.StringWriter sw = new java.io.StringWriter();
            e.printStackTrace(new java.io.PrintWriter(sw));
            throw new RuntimeException("Failed to parse plan: " + e.getMessage() + "\nStackTrace: " + sw.toString());
        }
    }

    private EnterpriseAIResponseDTO generateTasks(EnterpriseAIRequestDTO request, User user, AIContext context) {
        try {
            EnhancedAIPlan plan = planRepository.findByIdAndUser(request.getPlanId(), user)
                    .orElseThrow(() -> new RuntimeException("Plan not found"));

            List<EnhancedAITaskDTO> tasks;
            List<EnhancedAITask> existingTasks = taskRepository.findByPlanOrdered(plan);
            if (existingTasks != null && !existingTasks.isEmpty()) {
                tasks = existingTasks.stream().map(this::convertToDTO).collect(Collectors.toList());
            } else {
                tasks = generateTasksFromPlan(plan, user, context);
            }

            AIProjectStructureDTO projectStructureDTO = null;
            if (plan.getProjectStructure() != null) {
                projectStructureDTO = convertToProjectStructureDTO(plan.getProjectStructure());
            } else if (request.getCreateProject() != null && request.getCreateProject() && request.getWorkspaceId() != null) {
                AIProjectStructure projectStructure = createProjectStructure(plan, tasks, user, request.getWorkspaceId());
                if (projectStructure != null) {
                    projectStructureDTO = convertToProjectStructureDTO(projectStructure);
                    plan.setProjectStructure(projectStructure);
                    planRepository.save(plan);
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
            // Get current context and app state
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

            // Gather real-time workspace context
            if (request.getWorkspaceId() != null) {
                workspaceRepository.findById(request.getWorkspaceId()).ifPresent(ws -> {
                    contextData.put("currentWorkspace", ws.getName());
                    contextData.put("workspaceId", ws.getId());
                    
                    // Projects
                    List<Project> projects = projectRepository.findByWorkspace(ws);
                    contextData.put("projects", projects.stream()
                        .filter(Objects::nonNull)
                        .map(Project::getName)
                        .collect(Collectors.toList()));
                    
                    // Tasks
                    List<Todos> tasks = todosRepository.findByWorkspaceAndStatusNot(ws, Todos.Status.COMPLETED);
                    contextData.put("activeTasks", tasks.stream()
                        .filter(t -> t != null && t.getItem() != null)
                        .limit(10)
                        .map(t -> t.getItem() + " (Priority: " + t.getPriority() + ")")
                        .collect(Collectors.toList()));
                    contextData.put("activeTaskCount", tasks.size());

                    // Team Members (Crucial for "Assignment" feature)
                    List<Membership> members = membershipRepository.findByWorkspaceAndActiveTrue(ws);
                    contextData.put("teamMembers", members.stream()
                        .filter(m -> m != null && m.getUser() != null)
                        .map(m -> m.getUser().getName() + " (ID: " + m.getUser().getId() + ", Role: " + m.getRole() + ")")
                        .collect(Collectors.toList()));
                });
            } else {
                // Fallback to user-wide context
                List<Project> userProjects = projectRepository.findByCreatedBy(user);
                contextData.put("userProjects", userProjects.stream().map(Project::getName).collect(Collectors.toList()));
                
                List<Todos> userTasks = todosRepository.findByAssignedToAndStatusNot(user, Todos.Status.COMPLETED);
                contextData.put("userActiveTasks", userTasks.stream().limit(10).map(Todos::getItem).collect(Collectors.toList()));
            }

            // Create and save user message
            AIContextMessage userMsg = new AIContextMessage();
            userMsg.setRole("USER");
            userMsg.setContent(request.getMessage());
            userMsg.setContext(context);
            context.getMessageHistory().add(userMsg);

            // Build chat prompt
            String prompt = promptBuilder.buildChatPrompt(
                    request.getMessage(),
                    context.getMessageHistory(),
                    contextData,
                    request.getContext() != null ? request.getContext() : new HashMap<>()
            );

            // Set system prompt for ChatGPT-like personality
            String systemPrompt = """
                You are the Enterprise Executive AI Assistant for the Productivity Platform.
                You help the user manage their professional and personal goals with the precision of a top-tier project manager 
                and the conversational ease of ChatGPT.
                
                Guidelines:
                1. Always acknowledge user's current projects and tasks.
                2. Provide concrete steps for productivity improvements.
                3. Be proactive: if a user asks about progress, analyze their task list.
                4. Maintain a supportive, highly intelligent persona.
                """;

            // Call AI
            log.info("Sending chat request to AI client for user: {}", user.getEmail());
            String aiResponse = openAIClient.sendMessage(prompt, systemPrompt);
            log.info("AI response received (length: {})", aiResponse != null ? aiResponse.length() : "null");

            // Create and save AI response
            AIContextMessage aiMsg = new AIContextMessage();
            aiMsg.setRole("ASSISTANT");
            aiMsg.setContent(aiResponse);
            aiMsg.setContext(context);
            context.getMessageHistory().add(aiMsg);

            // Limit message history to prevent repetition and token bloat (keep last 15 messages)
            if (context.getMessageHistory().size() > 15) {
                int toRemove = context.getMessageHistory().size() - 15;
                for (int i = 0; i < toRemove; i++) {
                    context.getMessageHistory().remove(0);
                }
            }

            // Update context
            context.setInteractionCount(context.getInteractionCount() + 1);
            context.setLastInteraction(LocalDateTime.now());
            contextRepository.save(context);

            // Parse actions from AI response
            List<Map<String, Object>> executedActions = parseAndExecuteActions(aiResponse, user, request.getWorkspaceId());

            EnterpriseAIResponseDTO response = new EnterpriseAIResponseDTO();
            response.setSessionId(context.getSessionId());
            response.setAction("CHAT");
            response.setSuccess(true);
            response.setMessage(aiResponse);
            response.setData(Map.of("executedActions", executedActions));

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
            Map<String, Object> additionalContext = new HashMap<>();
            if (plan.getWorkspace() != null) {
                List<Membership> teamMembers = membershipRepository.findByWorkspaceAndActiveTrue(plan.getWorkspace());
                additionalContext.put("teamMembers", teamMembers.stream()
                    .map(m -> m.getUser().getName() + " (ID: " + m.getUser().getId() + ", Role: " + m.getRole() + ")")
                    .collect(Collectors.toList()));
            }

            // Build task generation prompt
            String prompt = promptBuilder.buildTaskGenerationPrompt(plan, context, additionalContext);

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
                task.setAssignedToId(taskDTO.getAssignedToId());
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
            String rawProjectName = plan.getTitle() + " - " + plan.getDurationDays() + " Day Plan";
            String projectName = truncate(rawProjectName, 255);
            String projectDesc = truncate(plan.getSummary() != null ? plan.getSummary() : "Dynamic learning plan for " + plan.getTitle(), 255);
            Project project = projectService.createProject(
                    workspaceId,
                    projectName,
                    projectDesc,
                    generateProjectColor(),
                    user.getEmail()
            );

            // Cleanup the default board created by projectService if we're doing AI WEEK structure
            boardRepository.findByProjectAndDeletedAtIsNull(project).stream()
                    .filter(b -> "Default Board".equals(b.getName()))
                    .forEach(b -> {
                        b.setDeletedAt(LocalDateTime.now());
                        boardRepository.save(b);
                    });

            // Create boards based on weeks - SORTED TreeMap ensure Week 1 comes first
            Map<Integer, List<EnhancedAITaskDTO>> tasksByWeek = tasks.stream()
                    .filter(t -> t.getWeekNumber() != null)
                    .collect(Collectors.groupingBy(
                            EnhancedAITaskDTO::getWeekNumber,
                            TreeMap::new,
                            Collectors.toList()
                    ));

            AIProjectStructure projectStructure = new AIProjectStructure();
            projectStructure.setProjectName(truncate(projectName, 255));
            projectStructure.setProjectDescription(projectDesc);
            projectStructure.setProjectColor(generateProjectColor());
            projectStructure.setCreatedProjectId(project.getId());
            projectStructure.setPlan(plan);

            List<AIBoardStructure> boardStructures = new ArrayList<>();

            // Calculate total weeks for better titles
            int totalWeeks = tasksByWeek.isEmpty() ? 0 : Collections.max(tasksByWeek.keySet());

            // Create boards for each week in order
            for (Map.Entry<Integer, List<EnhancedAITaskDTO>> entry : tasksByWeek.entrySet()) {
                Integer week = entry.getKey();
                List<EnhancedAITaskDTO> weekTasks = entry.getValue();

                // Sort tasks within the week by orderIndex
                weekTasks.sort(Comparator.comparing(t -> t.getOrderIndex() != null ? t.getOrderIndex() : 0));

                // Create board using correct parameters
                String boardName = truncate("Week " + week + " of " + totalWeeks + ": " + getWeekTheme(weekTasks), 255);
                String boardDesc = truncate("Tasks for week " + week + " of your 60-day plan", 255);
                Board board = boardService.createBoard(
                        project.getId(),
                        boardName,
                        boardDesc,
                        generateWeekColor(week),
                        user.getEmail()
                );

                AIBoardStructure boardStructure = new AIBoardStructure();
                boardStructure.setBoardName(truncate(boardName, 255));
                boardStructure.setBoardDescription(truncate(board.getDescription(), 255));
                boardStructure.setBoardColor(truncate(board.getColor(), 255));
                boardStructure.setOrderIndex(week);
                boardStructure.setCreatedBoardId(board.getId());
                boardStructure.setProjectStructure(projectStructure);

                // Get columns from the board
                List<BoardColumn> columns = board.getColumns();

                List<AIColumnStructure> columnStructures = new ArrayList<>();
                for (BoardColumn column : columns) {
                    AIColumnStructure columnStructure = new AIColumnStructure();
                    columnStructure.setColumnName(truncate(column.getName(), 255));
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

                // Create a Weekly Goal for this week's tasks
                Goal weeklyGoal = new Goal();
                weeklyGoal.setTitle(truncate(boardName, 255));
                weeklyGoal.setDescription(truncate("Complete tasks for week " + week, 255));
                weeklyGoal.setType("WEEKLY");
                weeklyGoal.setTarget(weekTasks.size());
                weeklyGoal.setUnit("tasks");
                weeklyGoal.setStartDate(LocalDate.now().plusWeeks(week - 1));
                weeklyGoal.setEndDate(LocalDate.now().plusWeeks(week));
                weeklyGoal.setUser(user);
                weeklyGoal.setWorkspace(workspaceRepository.findById(workspaceId).orElse(null));
                weeklyGoal.setProject(project);
                weeklyGoal.setPriority("MEDIUM");
                weeklyGoal.setColor(generateWeekColor(week));
                
                Goal savedGoal = goalRepository.save(weeklyGoal);

                // Create todos from tasks and link to the goal
                createTodosFromTasks(board, weekTasks, user, savedGoal.getId());
            }

            projectStructure.setBoards(boardStructures);
            AIProjectStructure savedStructure = projectStructureRepository.save(projectStructure);
            
            // Removed realtimeService for compilation fix
            return savedStructure;

        } catch (Exception e) {
            log.error("Failed to create project structure", e);
            throw new RuntimeException("Failed to create project structure: " + e.getMessage());
        }
    }

    private void createTodosFromTasks(Board board, List<EnhancedAITaskDTO> tasks, User user, Long goalId) {
        try {
            List<Todos> realTodosToSave = new ArrayList<>();
            Workspace workspace = board.getProject().getWorkspace();
            
            // Re-fetch columns directly from DB since the created Board entity might not have them flushed in memory yet
            List<BoardColumn> fetchedColumns = columnRepository.findByBoardAndDeletedAtIsNullOrderByOrderIndex(board);

            for (EnhancedAITaskDTO taskDTO : tasks) {
                Todos newTodo = new Todos();
                // Clean native titles (user requested no AI markers)
                newTodo.setItem(truncate(taskDTO.getTitle(), 255));
                newTodo.setDescription(truncate(taskDTO.getDescription() != null ? taskDTO.getDescription() : "Task from roadmap.", 255));
                newTodo.setStatus(Todos.Status.PENDING);
                
                Todos.Priority priority = Todos.Priority.NORMAL;
                try {
                    if (taskDTO.getPriority() != null) {
                        priority = Todos.Priority.valueOf(taskDTO.getPriority().toUpperCase());
                    }
                } catch (Exception e) {
                    priority = Todos.Priority.NORMAL; // fallback
                }
                newTodo.setPriority(priority);

                newTodo.setWorkspace(workspace);
                newTodo.setProject(board.getProject());
                newTodo.setBoard(board);
                
                // Add to first column safely
                List<BoardColumn> fallbackColumns = (fetchedColumns != null && !fetchedColumns.isEmpty()) ? fetchedColumns : board.getColumns();
                if (fallbackColumns != null && !fallbackColumns.isEmpty()) {
                    newTodo.setBoardColumn(fallbackColumns.get(0));
                    newTodo.setOrderIndex(realTodosToSave.size());
                }

                newTodo.setCreatedBy(user);
                
                // Try to assign based on record from AI, otherwise default to current user
                User assignedUser = user;
                if (taskDTO.getAssignedToId() != null) {
                    try {
                        Long assignedId = Long.parseLong(taskDTO.getAssignedToId());
                        assignedUser = userRepository.findById(assignedId).orElse(user);
                    } catch (Exception e) {
                        log.warn("Failed to find assigned user by ID: " + taskDTO.getAssignedToId() + ", using default.");
                    }
                }
                newTodo.setAssignedTo(assignedUser);
                newTodo.setCreatedAt(LocalDateTime.now());
                newTodo.setUpdatedAt(LocalDateTime.now());

                newTodo.setDueDate(taskDTO.getSuggestedDueDate());
                
                if (goalId != null) {
                    goalRepository.findById(goalId).ifPresent(newTodo::setGoal);
                }

                // Append any suggested tags
                if (taskDTO.getTags() != null) {
                    for (String tag : taskDTO.getTags()) {
                        newTodo.addLabel(tag);
                    }
                }

                realTodosToSave.add(newTodo);
            }
            
            todosRepository.saveAll(realTodosToSave);
            log.info("Successfully persisted {} real AI tasks to the database for board {}", realTodosToSave.size(), board.getId());
            
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
        task.setAssignedToId(dto.getAssignedToId());
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
        dto.setAssignedToId(task.getAssignedToId());
        dto.setParentTaskId(task.getParentTaskId());
        dto.setOrderIndex(task.getOrderIndex());
        dto.setAccepted(task.getAccepted());
        dto.setSuggestedStartDate(task.getSuggestedStartDate());
        dto.setSuggestedDueDate(task.getSuggestedDueDate());
        return dto;
    }

    public EnterpriseAIResponseDTO getContext(String sessionId, User user) {
        AIContext context = contextRepository.findBySessionIdAndUser(sessionId, user)
                .orElseGet(() -> {
                    EnterpriseAIRequestDTO req = new EnterpriseAIRequestDTO();
                    req.setSessionId(sessionId);
                    return createNewContext(req, user);
                });

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

    public EnterpriseAIResponseDTO handleAcceptTasks(EnterpriseAIRequestDTO request, User user) {
        log.info("Accepting AI tasks for user: {}", user.getEmail());
        EnterpriseAIResponseDTO response = new EnterpriseAIResponseDTO();
        response.setAction("ACCEPT_TASKS");
        response.setSuccess(true);
        
        try {
            List<EnhancedAITask> acceptedTasks = new ArrayList<>();
            
            // If specific IDs provided
            if (request.getTaskIds() != null && !request.getTaskIds().isEmpty()) {
                acceptedTasks = taskRepository.findAllByIdInWithPlan(request.getTaskIds());
            } else if (request.getTasks() != null && !request.getTasks().isEmpty()) {
                // If the user modified tasks and sent them back to be saved
                for (EnhancedAITaskDTO dto : request.getTasks()) {
                    EnhancedAITask task;
                    if (dto.getId() != null) {
                        task = taskRepository.findById(dto.getId()).orElse(new EnhancedAITask());
                    } else {
                        task = new EnhancedAITask();
                    }
                    updateTaskFromDTO(task, dto);
                    acceptedTasks.add(taskRepository.save(task));
                }
            }

            int createdCount = 0;
            for (EnhancedAITask aiTask : acceptedTasks) {
                if (aiTask.getCreatedTodo() == null) {
                    Todos todo = new Todos();
                    todo.setItem(aiTask.getTitle());
                    todo.setDescription(aiTask.getDescription());
                    todo.setStatus(Todos.Status.PENDING);
                    todo.setPriority(Todos.Priority.valueOf(aiTask.getPriority() != null ? aiTask.getPriority() : "NORMAL"));
                    todo.setDueDate(aiTask.getSuggestedDueDate());
                    if (aiTask.getOrderIndex() != null) {
                        todo.setOrderIndex(aiTask.getOrderIndex());
                    }
                    
                    // Assignment logic
                    if (aiTask.getAssignedToId() != null && !aiTask.getAssignedToId().isEmpty()) {
                        try {
                            Long assignedId = Long.parseLong(aiTask.getAssignedToId());
                            userRepository.findById(assignedId).ifPresent(todo::setAssignedTo);
                        } catch (Exception e) {
                            todo.setAssignedTo(user);
                        }
                    } else {
                        todo.setAssignedTo(user);
                    }
                    
                    todo.setCreatedBy(user);
                    todo.setIsAiGenerated(true);
                    
                    // If workspace provided
                    if (request.getWorkspaceId() != null) {
                        workspaceRepository.findById(request.getWorkspaceId()).ifPresent(todo::setWorkspace);
                    } else if (aiTask.getPlan() != null && aiTask.getPlan().getWorkspace() != null) {
                        todo.setWorkspace(aiTask.getPlan().getWorkspace());
                    }

                    Todos savedTodo = todosRepository.save(todo);
                    aiTask.setCreatedTodo(savedTodo);
                    aiTask.setAccepted(true);
                    taskRepository.save(aiTask);
                    createdCount++;
                }
            }

            response.setMessage("Successfully created " + createdCount + " integration tasks");
            response.setData(Map.of("createdCount", createdCount));
            
        } catch (Exception e) {
            log.error("Failed to accept tasks", e);
            response.setSuccess(false);
            response.setMessage("Failed to create tasks: " + e.getMessage());
        }
        
        return response;
    }

    private EnterpriseAIResponseDTO handleAssignTask(EnterpriseAIRequestDTO request, User user) {
        EnterpriseAIResponseDTO response = new EnterpriseAIResponseDTO();
        response.setAction("ASSIGN_TASK");
        response.setSuccess(true);
        
        try {
            Long taskId = Long.parseLong(request.getContext().get("taskId").toString());
            Long userId = Long.parseLong(request.getContext().get("assigneeId").toString());
            
            todosRepository.findById(taskId).ifPresent(todo -> {
                userRepository.findById(userId).ifPresent(assignee -> {
                    todo.setAssignedTo(assignee);
                    todosRepository.save(todo);
                    response.setMessage("Task assigned to " + assignee.getName());
                });
            });
        } catch (Exception e) {
            response.setSuccess(false);
            response.setMessage("Assignment failed: " + e.getMessage());
        }
        
        return response;
    }

    @Transactional
    public EnterpriseAIResponseDTO createContext(Map<String, Object> requestData, User user) {
        EnterpriseAIRequestDTO request = new EnterpriseAIRequestDTO();
        if (requestData.containsKey("learningStyle")) {
            request.setLearningStyle(requestData.get("learningStyle").toString());
        }
        if (requestData.containsKey("attentionSpan")) {
            request.setAttentionSpan(Integer.parseInt(requestData.get("attentionSpan").toString()));
        }

        AIContext context = createNewContext(request, user);
        
        EnterpriseAIResponseDTO response = new EnterpriseAIResponseDTO();
        response.setSessionId(context.getSessionId());
        response.setSuccess(true);
        response.setAction("CREATE_CONTEXT");
        
        Map<String, Object> insights = new HashMap<>();
        insights.put("learningStyle", context.getLearningStyle());
        insights.put("attentionSpan", context.getAttentionSpan());
        response.setInsights(insights);
        
        return response;
    }

    @Transactional
    public void updateContext(String sessionId, Map<String, Object> updates, User user) {
        AIContext context = contextRepository.findBySessionIdAndUser(sessionId, user)
                .orElseThrow(() -> new RuntimeException("Context not found"));

        if (updates.containsKey("learningStyle")) {
            context.setLearningStyle(updates.get("learningStyle").toString());
        }
        if (updates.containsKey("attentionSpan")) {
            context.setAttentionSpan(Integer.parseInt(updates.get("attentionSpan").toString()));
        }
        if (updates.containsKey("userPreferences")) {
            try {
                context.setUserPreferences(objectMapper.writeValueAsString(updates.get("userPreferences")));
            } catch (Exception e) {
                log.error("Failed to update user preferences", e);
            }
        }

        contextRepository.save(context);
    }

    @Transactional
    public void addMessageToContext(String sessionId, String role, String content, Map<String, Object> metadata, User user) {
        AIContext context = contextRepository.findBySessionIdAndUser(sessionId, user)
                .orElseThrow(() -> new RuntimeException("Context not found"));

        AIContextMessage message = new AIContextMessage();
        message.setContext(context);
        message.setRole(role);
        message.setContent(content);
        try {
            message.setMetadata(objectMapper.writeValueAsString(metadata));
        } catch (Exception e) {
            log.error("Failed to save message metadata", e);
        }

        context.getMessageHistory().add(message);
        contextRepository.save(context);
    }

    public List<Map<String, Object>> getContextMessages(String sessionId, User user) {
        Optional<AIContext> contextOpt = contextRepository.findBySessionIdAndUser(sessionId, user);
        if (contextOpt.isEmpty()) {
            return new ArrayList<>(); // Return empty list instead of throwing 500 error for non-existent session
        }
        
        AIContext context = contextOpt.get();
        if (context.getMessageHistory() == null) {
            return new ArrayList<>();
        }

        return context.getMessageHistory().stream().map(m -> {
            Map<String, Object> map = new HashMap<>();
            map.put("role", m.getRole());
            map.put("content", m.getContent());
            map.put("timestamp", m.getTimestamp());
            try {
                if (m.getMetadata() != null) {
                    map.put("metadata", objectMapper.readValue(m.getMetadata(), Map.class));
                }
            } catch (Exception e) {
                log.error("Failed to parse message metadata", e);
            }
            return map;
        }).collect(Collectors.toList());
    }

    private List<Map<String, Object>> parseAndExecuteActions(String aiResponse, User user, Long workspaceId) {
        List<Map<String, Object>> executed = new ArrayList<>();
        // Regex for ACTION: NAME(params)
        Pattern pattern = Pattern.compile("ACTION:\\s*([A-Z_]+)\\(([^)]*)\\)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(aiResponse);

        while (matcher.find()) {
            String actionName = matcher.group(1).toUpperCase();
            String paramsStr = matcher.group(2);
            String[] params = paramsStr.split(",\\s*");

            try {
                Map<String, Object> result = null;
                switch (actionName) {
                    case "ASSIGN_TASK":
                        if (params.length >= 2) result = executeAssignTask(Long.parseLong(params[0].trim()), Long.parseLong(params[1].trim()), user);
                        break;
                    case "CREATE_PROJECT":
                        if (params.length >= 1) result = executeCreateProject(params[0].trim().replace("'", ""), workspaceId, user);
                        break;
                    case "CREATE_GOAL":
                        if (params.length >= 4) result = executeCreateGoal(params, workspaceId, user);
                        break;
                    case "SET_REMINDER":
                        if (params.length >= 3) result = executeSetReminder(params, user);
                        break;
                    case "SCHEDULE_TIME_BLOCK":
                        if (params.length >= 3) result = executeScheduleTimeBlock(params, workspaceId, user);
                        break;
                }
                if (result != null) executed.add(result);
            } catch (Exception e) {
                log.error("Failed to execute AI action: {} with params: {}", actionName, paramsStr, e);
            }
        }
        return executed;
    }

    private Map<String, Object> executeAssignTask(Long taskId, Long assigneeId, User user) {
        Optional<Todos> todoOpt = todosRepository.findById(taskId);
        Optional<User> assigneeOpt = userRepository.findById(assigneeId);
        
        if (todoOpt.isPresent() && assigneeOpt.isPresent()) {
            Todos todo = todoOpt.get();
            User assignee = assigneeOpt.get();
            todo.setAssignedTo(assignee);
            todosRepository.save(todo);
            return Map.of("action", "ASSIGN_TASK", "status", "SUCCESS", "message", "Task assigned to " + assignee.getName());
        }
        return Map.of("action", "ASSIGN_TASK", "status", "FAILED");
    }

    private Map<String, Object> executeCreateProject(String name, Long workspaceId, User user) {
        if (workspaceId == null) return Map.of("action", "CREATE_PROJECT", "status", "FAILED", "reason", "No workspace selected");
        Project project = projectService.createProject(workspaceId, name, "Created via AI Assistant", "#6366f1", user.getEmail());
        return Map.of("action", "CREATE_PROJECT", "status", "SUCCESS", "projectId", project.getId(), "projectName", project.getName());
    }

    private Map<String, Object> executeCreateGoal(String[] params, Long workspaceId, User user) {
        // title, target, unit, type
        GoalDTO dto = new GoalDTO();
        dto.setTitle(params[0].trim().replace("'", ""));
        dto.setTarget(Integer.parseInt(params[1].trim()));
        dto.setUnit(params[2].trim().replace("'", ""));
        dto.setType(params[3].trim().toUpperCase().replace("'", ""));
        dto.setWorkspaceId(workspaceId);
        dto.setStartDate(LocalDate.now());
        dto.setEndDate(LocalDate.now().plusMonths(1)); // Default 1 month
        
        goalService.createGoal(dto, user);
        return Map.of("action", "CREATE_GOAL", "status", "SUCCESS", "goalTitle", dto.getTitle());
    }

    private Map<String, Object> executeSetReminder(String[] params, User user) {
        // title, todoId, leadTime
        ReminderDTO dto = new ReminderDTO();
        dto.setTitle(params[0].trim().replace("'", ""));
        dto.setTodoId(Long.parseLong(params[1].trim()));
        int leadTime = Integer.parseInt(params[2].trim());
        
        Optional<Todos> todo = todosRepository.findById(dto.getTodoId());
        if (todo.isPresent() && todo.get().getDueDateTime() != null) {
            dto.setScheduledFor(todo.get().getDueDateTime().minusMinutes(leadTime));
            reminderService.scheduleReminder(dto, user);
            return Map.of("action", "SET_REMINDER", "status", "SUCCESS", "reminderTitle", dto.getTitle());
        }
        return Map.of("action", "SET_REMINDER", "status", "FAILED", "reason", "Task or Due Date not found");
    }

    private Map<String, Object> executeScheduleTimeBlock(String[] params, Long workspaceId, User user) {
        // title, startTime, endTime (ISO format expected from AI if possible, or relative)
        TimeBlockDTO dto = new TimeBlockDTO();
        dto.setTitle(params[0].trim().replace("'", ""));
        try {
            dto.setStartTime(LocalDateTime.parse(params[1].trim().replace("'", "")));
            dto.setEndTime(LocalDateTime.parse(params[2].trim().replace("'", "")));
        } catch (Exception e) {
            // Fallback: today at 2pm-3pm if parsing fails
            dto.setStartTime(LocalDateTime.now().withHour(14).withMinute(0));
            dto.setEndTime(LocalDateTime.now().withHour(15).withMinute(0));
        }
        dto.setWorkspaceId(workspaceId);
        dto.setColor("#6366f1");
        
        timeBlockService.createTimeBlock(dto, user);
        return Map.of("action", "SCHEDULE_TIME_BLOCK", "status", "SUCCESS", "blockTitle", dto.getTitle());
    }

    private String truncate(String text, int maxLength) {
        if (text == null) return null;
        if (text.length() <= maxLength) return text;
        return text.substring(0, maxLength - 3) + "...";
    }

    public Map<String, Object> analyzeWorkload(Long workspaceId, User user) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
        
        List<Todos> activeTasks = todosRepository.findByWorkspaceAndStatusNot(workspace, Todos.Status.COMPLETED);
        
        String prompt = promptBuilder.buildWorkloadAnalysisPrompt(activeTasks, user.getName());
        String aiResponse = openAIClient.sendMessage(prompt);
        
        return Map.of(
            "summary", aiResponse,
            "taskCount", activeTasks.size(),
            "timestamp", LocalDateTime.now()
        );
    }
}
