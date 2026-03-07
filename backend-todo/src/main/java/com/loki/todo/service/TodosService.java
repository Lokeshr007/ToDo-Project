package com.loki.todo.service;

import com.loki.todo.dto.TodoRequest;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import com.loki.todo.repository.TodosSpecification;
import com.loki.todo.security.WorkspaceAccess;
import com.loki.todo.security.WorkspaceContext;
import com.loki.todo.workflow.WorkflowEventPublisher;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
public class TodosService {

    private final TodosRepository todoRepo;
    private final UserRepository userRepo;
    private final WorkspaceRepository workspaceRepo;
    private final ProjectRepository projectRepo;
    private final BoardRepository boardRepo;
    private final BoardColumnRepository columnRepo;
    private final MembershipRepository membershipRepo;
    private final CommentService commentService;
    private final TimeTrackingService timeTrackingService;
    private final AttachmentRepository attachmentRepo;
    private final BoardActivityRepository activityRepo;
    private final GoalRepository goalRepo;
    private final ApplicationEventPublisher eventPublisher;
    private final WorkflowEventPublisher workflowEventPublisher;
    private final NotificationService notificationService;
    private final RealtimeNotificationService realtimeService;

    @PersistenceContext
    private EntityManager entityManager;

    public TodosService(
            TodosRepository todoRepo,
            UserRepository userRepo,
            WorkspaceRepository workspaceRepo,
            ProjectRepository projectRepo,
            BoardRepository boardRepo,
            BoardColumnRepository columnRepo,
            MembershipRepository membershipRepo,
            CommentService commentService,
            TimeTrackingService timeTrackingService,
            AttachmentRepository attachmentRepo,
            BoardActivityRepository activityRepo,
            GoalRepository goalRepo,
            ApplicationEventPublisher eventPublisher,
            WorkflowEventPublisher workflowEventPublisher,
            NotificationService notificationService,
            RealtimeNotificationService realtimeService) {

        this.todoRepo = todoRepo;
        this.userRepo = userRepo;
        this.workspaceRepo = workspaceRepo;
        this.projectRepo = projectRepo;
        this.boardRepo = boardRepo;
        this.columnRepo = columnRepo;
        this.membershipRepo = membershipRepo;
        this.commentService = commentService;
        this.timeTrackingService = timeTrackingService;
        this.attachmentRepo = attachmentRepo;
        this.activityRepo = activityRepo;
        this.goalRepo = goalRepo;
        this.eventPublisher = eventPublisher;
        this.workflowEventPublisher = workflowEventPublisher;
        this.notificationService = notificationService;
        this.realtimeService = realtimeService;
    }

    private User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Workspace getCurrentWorkspace() {
        Long workspaceId = WorkspaceContext.getWorkspaceId();
        if (workspaceId == null) {
            throw new RuntimeException("No workspace selected");
        }
        return workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));
    }

    private void validateWorkspaceAccess(Workspace workspace, String email) {
        User user = getUserByEmail(email);
        if (!membershipRepo.existsByUserAndWorkspace(user, workspace)) {
            throw new RuntimeException("Access denied to this workspace");
        }
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public List<Todos> getTasks(String email, int page, int size) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Todos> todoPage = todoRepo.findByWorkspace(workspace, pageable);
        return todoPage.getContent();
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public List<Todos> getFilteredTasks(String email, String filter, Long projectId,
                                        String priority, String status, Long assigneeId,
                                        LocalDate dueDate, List<String> labels,
                                        int page, int size) {
        
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        User user = getUserByEmail(email);

        Specification<Todos> spec = Specification.where(TodosSpecification.hasWorkspace(workspace));

        if (projectId != null) spec = spec.and(TodosSpecification.hasProjectId(projectId));
        if (assigneeId != null) spec = spec.and(TodosSpecification.hasAssigneeId(assigneeId));
        if (dueDate != null) spec = spec.and(TodosSpecification.hasDueDate(dueDate));
        
        if (status != null && !status.equals("all")) {
            try {
                spec = spec.and(TodosSpecification.hasStatus(Todos.Status.valueOf(status)));
            } catch (Exception ignored) {}
        }
        
        if (priority != null && !priority.equals("all")) {
            try {
                spec = spec.and(TodosSpecification.hasPriority(Todos.Priority.valueOf(priority)));
            } catch (Exception ignored) {}
        }

        // Apply preset filters
        if ("overdue".equals(filter)) {
            spec = spec.and(TodosSpecification.isOverdue());
        } else if ("completed".equals(filter)) {
            spec = spec.and(TodosSpecification.hasStatus(Todos.Status.COMPLETED));
        } else if ("pending".equals(filter)) {
            spec = spec.and((root, query, cb) -> cb.notEqual(root.get("status"), Todos.Status.COMPLETED));
        }

        Sort sort = Sort.by(Sort.Order.asc("dueDate"), Sort.Order.asc("id"));
        Pageable pageable = PageRequest.of(page, size, sort);

        return todoRepo.findAll(spec, pageable).getContent();
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public Todos getTaskById(Long id, String email) {
        Workspace workspace = getCurrentWorkspace();

        Todos todo = todoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        validateWorkspaceAccess(workspace, email);

        return todo;
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public Map<String, Object> getTaskStats(String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);

        Map<String, Object> stats = new HashMap<>();

        // Basic counts
        stats.put("total", todoRepo.countByWorkspace(workspace));
        stats.put("completed", todoRepo.countCompletedInWorkspace(workspace));
        stats.put("pending", todoRepo.countPendingInWorkspace(workspace));
        stats.put("overdue", todoRepo.countOverdueInWorkspace(workspace));
        stats.put("dueToday", todoRepo.countDueTodayInWorkspace(workspace));
        stats.put("inProgress", todoRepo.countInProgressInWorkspace(workspace));
        stats.put("blocked", todoRepo.countBlockedInWorkspace(workspace));

        // Status breakdown
        List<Object[]> statusCounts = todoRepo.countByStatus(workspace);
        Map<String, Long> statusMap = statusCounts.stream()
                .collect(Collectors.toMap(
                        arr -> ((Todos.Status) arr[0]).name(),
                        arr -> (Long) arr[1]
                ));
        stats.put("byStatus", statusMap);

        // Priority breakdown
        List<Object[]> priorityCounts = todoRepo.countByPriority(workspace);
        Map<String, Long> priorityMap = priorityCounts.stream()
                .collect(Collectors.toMap(
                        arr -> ((Todos.Priority) arr[0]).name(),
                        arr -> (Long) arr[1]
                ));
        stats.put("byPriority", priorityMap);

        // Average completion time
        Double avgCompletion = todoRepo.averageCompletionTime(workspace);
        stats.put("avgCompletionHours", avgCompletion != null ? avgCompletion : 0);

        return stats;
    }

    @WorkspaceAccess
    @Transactional
    public Todos addTask(TodoRequest request, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        User creator = getUserByEmail(email);

        // Validate title
        String title = request.getItem();
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Task title is required");
        }
        
        if (title.length() > 1000) {
            title = title.substring(0, 995) + "...";
        }

        // Find project if provided
        Project project = null;
        if (request.getProjectId() != null) {
            project = projectRepo.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));

            if (!project.getWorkspace().getId().equals(workspace.getId())) {
                throw new RuntimeException("Project not in current workspace");
            }
        }

        // Find goal if provided
        Goal goal = null;
        if (request.getGoalId() != null) {
            goal = goalRepo.findById(request.getGoalId())
                    .orElseThrow(() -> new RuntimeException("Goal not found"));
        }

        // Find board if provided or default to the first board in the project
        Board board = null;
        if (request.getBoardId() != null) {
            board = boardRepo.findById(request.getBoardId())
                    .orElseThrow(() -> new RuntimeException("Board not found"));
            
            // Link project automatically from board if it was omitted
            if (project == null && board.getProject() != null) {
                project = board.getProject();
            }
        } else if (project != null) {
            List<Board> projectBoards = boardRepo.findByProjectOrderByOrderIndex(project);
            if (projectBoards != null && !projectBoards.isEmpty()) {
                board = projectBoards.get(0);
            }
        }

        // Find assigned user if provided
        User assignedTo = null;
        if (request.getAssignedUserId() != null) {
            assignedTo = userRepo.findById(request.getAssignedUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));

            // Verify assigned user is in workspace
            if (!membershipRepo.existsByUserAndWorkspace(assignedTo, workspace)) {
                throw new RuntimeException("Assigned user is not a member of this workspace");
            }
        }

        LocalDateTime dueDateTime = request.getProcessedDueDateTime();
        LocalDate dueDate = request.getDueDate();

        // Create todo using domain constructor
        Todos todo = new Todos(
                title,
                request.getDescription(),
                workspace,
                creator,
                request.getPriorityEnum(),
                dueDate,
                dueDateTime,
                project,
                assignedTo,
                request.getStoryPoints()
        );

        // Process multiple assignees
        if (request.getAssigneeIds() != null && !request.getAssigneeIds().isEmpty()) {
            for (Long assigneeId : request.getAssigneeIds()) {
                userRepo.findById(assigneeId).ifPresent(user -> {
                    if (membershipRepo.existsByUserAndWorkspace(user, workspace)) {
                        todo.addAssignee(user);
                    }
                });
            }
        } else if (assignedTo != null) {
            // If only single assignedTo exists, add it to assignees as well
            todo.addAssignee(assignedTo);
        }

        if (goal != null) {
            todo.setGoal(goal);
        }

        // Set status if provided
        if (request.getStatus() != null) {
            try {
                Todos.Status status = Todos.Status.valueOf(request.getStatus().toUpperCase());
                if (status == Todos.Status.COMPLETED) {
                    todo.complete();
                } else if (status == Todos.Status.IN_PROGRESS) {
                    todo.start();
                }
            } catch (IllegalArgumentException e) {
                log.warn("Invalid status: {}", request.getStatus());
            }
        }

        if (board != null) {
            todo.moveToBoard(board);

            // If column specified, add to that column
            if (request.getColumnId() != null) {
                BoardColumn column = columnRepo.findById(request.getColumnId())
                        .orElse(null);
                if (column != null && column.getBoard().getId().equals(board.getId())) {
                    todo.setBoardColumn(column);
                    todo.setOrderIndex(column.getTodos().size());
                }
            } else {
                // If board has default column, add to it
                BoardColumn defaultColumn = columnRepo.findByBoardAndTypeAndDeletedAtIsNull(board, BoardColumn.ColumnType.TODO)
                        .orElse(null);
                if (defaultColumn != null) {
                    todo.setBoardColumn(defaultColumn);
                    todo.setOrderIndex(defaultColumn.getTodos().size());
                } else {
                    // Fallback to the first available column to prevent ghost tasks
                    List<BoardColumn> allColumns = columnRepo.findByBoardAndDeletedAtIsNullOrderByOrderIndex(board);
                    if (allColumns != null && !allColumns.isEmpty()) {
                        BoardColumn firstColumn = allColumns.get(0);
                        todo.setBoardColumn(firstColumn);
                        todo.setOrderIndex(firstColumn.getTodos().size());
                    }
                }
            }
        }

        // Add labels if provided
        if (request.getLabels() != null) {
            for (String label : request.getLabels()) {
                todo.addLabel(label);
            }
        }

        Todos saved = todoRepo.save(todo);

        // Record activity
        if (board != null) {
            BoardActivity activity = BoardActivity.taskCreated(board, saved, creator);
            activityRepo.save(activity);
        }

        // Publish domain events
        saved.getDomainEvents().forEach(eventPublisher::publishEvent);
        saved.clearDomainEvents();

        log.info("Task created: {} by user: {}", saved.getId(), email);

        // Real-time update
        realtimeService.sendWorkspaceUpdate(workspace.getId(), "TASK_CREATED", Map.of(
                "taskId", saved.getId(),
                "item", saved.getItem(),
                "status", saved.getStatus()
        ));

        return saved;
    }

    @WorkspaceAccess
    @Transactional
    public Todos updateTask(Long id, TodoRequest request, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        User user = getUserByEmail(email);

        Todos todo = todoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        // Track changes for activity
        StringBuilder changes = new StringBuilder();
        boolean assignmentChanged = false;

        // Update using domain methods
        if (request.getItem() != null && !request.getItem().equals(todo.getItem())) {
            todo.updateItem(request.getItem());
            changes.append("Title changed, ");
        }

        if (request.getDescription() != null && !request.getDescription().equals(todo.getDescription())) {
            todo.updateDescription(request.getDescription());
            changes.append("Description updated, ");
        }

        if (request.getPriority() != null) {
            Todos.Priority newPriority = request.getPriorityEnum();
            if (todo.getPriority() != newPriority) {
                todo.changePriority(newPriority);
                changes.append("Priority changed, ");
            }
        }

        // Handle due date update
        LocalDateTime newDueDateTime = request.getProcessedDueDateTime();
        LocalDate newDueDate = request.getDueDate();

        if (newDueDateTime != null) {
            if (todo.getDueDateTime() == null || !newDueDateTime.equals(todo.getDueDateTime())) {
                todo.setDueDate(newDueDate, newDueDateTime);
                changes.append("Due date changed, ");
            }
        } else if (newDueDate != null) {
            LocalDateTime newDateTime = newDueDate.atTime(23, 59, 59);
            if (todo.getDueDateTime() == null || !newDateTime.equals(todo.getDueDateTime())) {
                todo.setDueDate(newDueDate, newDateTime);
                changes.append("Due date changed, ");
            }
        }

        if (request.getProjectId() != null) {
            Project project = projectRepo.findById(request.getProjectId())
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            if (todo.getProject() == null || !todo.getProject().equals(project)) {
                todo.moveToProject(project);
                
                // Auto-assign to default board and column if moving to a new project natively
                if (todo.getBoard() == null || !todo.getBoard().getProject().getId().equals(project.getId())) {
                    List<Board> projectBoards = boardRepo.findByProjectOrderByOrderIndex(project);
                    if (projectBoards != null && !projectBoards.isEmpty()) {
                        Board defaultBoard = projectBoards.get(0);
                        todo.moveToBoard(defaultBoard);
                        
                        BoardColumn defaultCol = columnRepo.findByBoardAndTypeAndDeletedAtIsNull(defaultBoard, BoardColumn.ColumnType.TODO).orElse(null);
                        if (defaultCol != null) {
                            todo.setBoardColumn(defaultCol);
                            todo.setOrderIndex(defaultCol.getTodos().size());
                        }
                    }
                }
                
                changes.append("Project changed, ");
            }
        }

        if (request.getAssignedUserId() != null) {
            User assignedTo = userRepo.findById(request.getAssignedUserId())
                    .orElseThrow(() -> new RuntimeException("Assigned user not found"));
            if (todo.getAssignedTo() == null || !todo.getAssignedTo().equals(assignedTo)) {
                todo.assignTo(assignedTo);
                changes.append("Assignee changed, ");
                assignmentChanged = true;
                
                // NOTIFY
                notificationService.sendTaskAssignedNotification(todo, assignedTo);
            }
        }

        // Handle multiple assignees
        if (request.getAssigneeIds() != null) {
            todo.getAssignees().clear();
            for (Long assigneeId : request.getAssigneeIds()) {
                userRepo.findById(assigneeId).ifPresent(todo::addAssignee);
            }
            changes.append("Multi-assignees updated, ");
        }

        if (request.getStoryPoints() != null) {
            todo.setStoryPoints(request.getStoryPoints());
            changes.append("Story points updated, ");
        }

        // Update labels if provided
        if (request.getLabels() != null) {
            todo.getLabels().clear();
            for (String label : request.getLabels()) {
                todo.addLabel(label);
            }
            changes.append("Labels updated, ");
        }

        Todos saved = todoRepo.save(todo);

        // Record activity if there were changes
        if (changes.length() > 0 && todo.getBoard() != null) {
            BoardActivity activity = new BoardActivity();
            activity.setType(BoardActivity.ActivityType.TASK_UPDATED);
            activity.setBoard(todo.getBoard());
            activity.setTodo(saved);
            activity.setPerformedBy(user);
            activity.setDescription(String.format("Task '%s' updated: %s",
                    saved.getItem(), changes.substring(0, changes.length() - 2)));
            activityRepo.save(activity);
        }

        // Publish domain events
        saved.getDomainEvents().forEach(eventPublisher::publishEvent);
        saved.clearDomainEvents();

        log.info("Task updated: {} by user: {}", id, email);

        return saved;
    }

    @WorkspaceAccess
    @Transactional
    public Todos changeStatus(Long id, Todos.Status newStatus, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        User user = getUserByEmail(email);

        Todos todo = todoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        Todos.Status oldStatus = todo.getStatus();

        // Apply status change using direct setters to allow free transitions
        switch (newStatus) {
            case COMPLETED:
                todo.setStatus(Todos.Status.COMPLETED);
                todo.setCompletedAt(LocalDateTime.now());
                // Send completion notification
                notificationService.sendTaskCompletedNotification(todo);
                break;
            case IN_PROGRESS:
                todo.setStatus(Todos.Status.IN_PROGRESS);
                if (todo.getStartedAt() == null) {
                    todo.setStartedAt(LocalDateTime.now());
                }
                break;
            case PENDING:
                todo.setStatus(Todos.Status.PENDING);
                todo.setCompletedAt(null);
                break;
            default:
                todo.setStatus(newStatus);
                break;
        }

        Todos saved = todoRepo.save(todo);

        // Record activity
        if (todo.getBoard() != null) {
            BoardActivity activity = new BoardActivity();
            activity.setType(mapStatusToActivityType(newStatus));
            activity.setBoard(todo.getBoard());
            activity.setTodo(saved);
            activity.setPerformedBy(user);
            activity.setDescription(String.format("Task '%s' moved from %s to %s",
                    saved.getItem(), oldStatus, newStatus));
            activity.setOldValue(oldStatus.name());
            activity.setNewValue(newStatus.name());
            activityRepo.save(activity);
        }

        saved.getDomainEvents().forEach(eventPublisher::publishEvent);
        saved.clearDomainEvents();

        log.info("Task status changed: {} from {} to {} by user: {}",
                id, oldStatus, newStatus, email);

        return saved;
    }

    private BoardActivity.ActivityType mapStatusToActivityType(Todos.Status status) {
        switch (status) {
            case COMPLETED: return BoardActivity.ActivityType.TASK_COMPLETED;
            case ARCHIVED: return BoardActivity.ActivityType.TASK_ARCHIVED;
            default: return BoardActivity.ActivityType.TASK_UPDATED;
        }
    }

    @WorkspaceAccess
    @Transactional
    public void deleteTask(Long id, boolean permanent, String email) {
        deleteTaskInternal(id, permanent, email, false);
    }

    @Transactional
    public void deleteTaskInternal(Long id, boolean permanent, String email, boolean forceAllow) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        User user = getUserByEmail(email);

        // Use findByIdIncludeDeleted to find even soft-deleted tasks
        Todos todo = todoRepo.findByIdIncludeDeleted(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
        throw new RuntimeException("Access denied: Task does not belong to current workspace");
    }

    if (permanent) {
        // SECURITY UPDATE: Only Admin, Owner, or Task Creator can permanently delete
        User authUser = getUserByEmail(email);
        Membership membership = membershipRepo.findByUserAndWorkspace(authUser, workspace)
                .orElseThrow(() -> new RuntimeException("Membership not found"));
        
        boolean isCreator = todo.getCreatedBy() != null && todo.getCreatedBy().getId().equals(authUser.getId());
        if (!forceAllow && !isCreator && !"OWNER".equals(membership.getRole()) && !"ADMIN".equals(membership.getRole())) {
            throw new RuntimeException("Unauthorized: Only Admins, Owners, or the task creator can permanently delete tasks.");
        }

        // Permanent delete - remove all related data
        commentService.deleteByTodo(todo);
        attachmentRepo.deleteByTodo(todo);
        timeTrackingService.deleteByTodo(todo);
        activityRepo.deleteByTodo(todo);
        
        // Remove foreign key references from other tables without deleting those records
        entityManager.createNativeQuery("UPDATE ai_generated_tasks SET created_todo_id = NULL WHERE created_todo_id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("UPDATE enhanced_ai_tasks SET created_todo_id = NULL WHERE created_todo_id = :id")
                .setParameter("id", id).executeUpdate();
                
        entityManager.createNativeQuery("UPDATE time_blocks SET todo_id = NULL WHERE todo_id = :id")
                .setParameter("id", id).executeUpdate();
        entityManager.createNativeQuery("UPDATE reminders SET todo_id = NULL WHERE todo_id = :id")
                .setParameter("id", id).executeUpdate();
        
        // Delete notifications related to this task
        entityManager.createNativeQuery("DELETE FROM notifications WHERE todo_id = :id")
                .setParameter("id", id).executeUpdate();
        
        entityManager.createNativeQuery("DELETE FROM goal_linked_tasks WHERE task_id = :id")
                .setParameter("id", id).executeUpdate();
        
        todoRepo.delete(todo);
        log.info("Task permanently deleted: {} by user: {}", id, email);
    } else {
        // Soft delete
        todo.softDelete();
        todoRepo.save(todo);
        
        // Record activity only if soft deleting
        if (todo.getBoard() != null) {
            BoardActivity activity = new BoardActivity();
            activity.setType(BoardActivity.ActivityType.TASK_ARCHIVED);
            activity.setBoard(todo.getBoard());
            activity.setTodo(todo);
            activity.setPerformedBy(user);
            activity.setDescription(String.format("Task '%s' archived", todo.getItem()));
            activityRepo.save(activity);
        }

        todoRepo.flush();          // Force SQL execution
        log.info("Task soft deleted: {} by user: {}", id, email);
    }

    // REAL-TIME SYNC: Notify project and workspace members
    if (todo.getProject() != null) {
        realtimeService.sendProjectUpdate(todo.getProject().getId(), "TASK_DELETED", 
            Map.of("taskId", id, "permanent", permanent));
    }
}

    @WorkspaceAccess
    @Transactional
    public void restoreTask(Long id, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        User user = getUserByEmail(email);

        // Use findByIdIncludeDeleted to find soft-deleted tasks
        Todos todo = todoRepo.findByIdIncludeDeleted(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (todo.getDeletedAt() == null) {
            throw new RuntimeException("Task is not deleted");
        }

        todo.restore();
        Todos saved = todoRepo.save(todo);
        todoRepo.flush();
        entityManager.clear();

        if (saved.getBoard() != null) {
            BoardActivity activity = new BoardActivity();
            activity.setType(BoardActivity.ActivityType.TASK_RESTORED);
            activity.setBoard(saved.getBoard());
            activity.setTodo(saved);
            activity.setPerformedBy(user);
            activity.setDescription(String.format("Task '%s' restored", saved.getItem()));
            activityRepo.save(activity);
        }

        saved.getDomainEvents().forEach(eventPublisher::publishEvent);
        saved.clearDomainEvents();

        log.info("Task restored: {} by user: {}", id, email);
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public List<Todos> searchTasks(String query, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        return todoRepo.searchInWorkspace(workspace, query);
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public List<Todos> getDeletedTasks(String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        return todoRepo.findDeletedByWorkspace(workspace);
    }

    // Comment methods
    @WorkspaceAccess
    @Transactional
    public Comment addComment(Long todoId, String content, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);

        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        return commentService.addComment(todoId, content, email);
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public List<Comment> getComments(Long todoId, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);

        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        return commentService.getComments(todoId);
    }

    // Time tracking methods
    @WorkspaceAccess
    @Transactional
    public TimeTracking startTimeTracking(Long todoId, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);

        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        return timeTrackingService.startTimeTracking(todoId, email);
    }

    public TimeTracking getActiveTimer(String email) {
        return timeTrackingService.getActiveTimer(email);
    }

    @WorkspaceAccess
    @Transactional
    public TimeTracking stopTimeTracking(Long trackingId, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        return timeTrackingService.stopTimeTracking(trackingId, email);
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public List<TimeTracking> getTimeTracking(Long todoId, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);

        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        return timeTrackingService.getTimeTracking(todoId);
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public Double getTotalTimeForTodo(Long todoId, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);

        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        return timeTrackingService.getTotalTimeForTodo(todoId);
    }

    @WorkspaceAccess
    @Transactional
    public void bulkDelete(List<Long> ids, boolean permanent, String email) {
        List<String> errors = new ArrayList<>();
        for (Long id : ids) {
            try {
                // Call the internal method directly to avoid breaking transactional boundaries for self-invocation
                deleteTaskInternal(id, permanent, email, false);
            } catch (Exception e) {
                log.warn("Failed to delete task {} in bulk: {}", id, e.getMessage());
                errors.add("Task ID " + id + ": " + e.getMessage());
            }
        }
        
        if (!errors.isEmpty()) {
            throw new RuntimeException("Bulk delete failed for some tasks:\n" + String.join("\n", errors));
        }
    }

    @WorkspaceAccess
    @Transactional
    public void bulkUpdateStatus(List<Long> ids, Todos.Status status, String email) {
        todoRepo.updateStatusByIds(ids, status);
        log.info("Bulk updated status for {} tasks to {} by user: {}", ids.size(), status, email);
        
        // Trigger real-time updates for each unique project affected
        todoRepo.findAllById(ids).stream()
                .map(Todos::getProject)
                .filter(Objects::nonNull)
                .map(Project::getId)
                .distinct()
                .forEach(pid -> realtimeService.sendProjectUpdate(pid, "BULK_TASK_UPDATED", 
                    Map.of("type", "STATUS", "value", status)));
    }

    @WorkspaceAccess
    @Transactional
    public void bulkAssign(List<Long> ids, Long userId, String email) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        todoRepo.updateAssigneeByIds(ids, user);
        log.info("Bulk assigned {} tasks to user {} by user: {}", ids.size(), userId, email);

        // Trigger real-time updates for each unique project affected
        todoRepo.findAllById(ids).stream()
                .map(Todos::getProject)
                .filter(Objects::nonNull)
                .map(Project::getId)
                .distinct()
                .forEach(pid -> realtimeService.sendProjectUpdate(pid, "BULK_TASK_UPDATED", 
                    Map.of("type", "ASSIGNEE", "value", user.getName())));
    }

    @WorkspaceAccess
    @Transactional
    public Todos addAssigneeToTask(Long id, Long userId, String email) {
        Todos todo = getTaskById(id, email);
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        todo.addAssignee(user);
        Todos saved = todoRepo.save(todo);

        // Publish domain events
        saved.getDomainEvents().forEach(eventPublisher::publishEvent);
        saved.clearDomainEvents();

        // Broadcast a notification
        notificationService.sendTaskAssignedNotification(saved, user);

        return saved;
    }

    @WorkspaceAccess
    @Transactional
    public Todos removeAssigneeFromTask(Long id, Long userId, String email) {
        Todos todo = getTaskById(id, email);
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        todo.removeAssignee(user);
        Todos saved = todoRepo.save(todo);
        
        // Publish domain events
        saved.getDomainEvents().forEach(eventPublisher::publishEvent);
        saved.clearDomainEvents();
        
        return saved;
    }
}