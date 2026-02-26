package com.loki.todo.service;

import com.loki.todo.dto.TodoRequest;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    private final CommentRepository commentRepo;
    private final AttachmentRepository attachmentRepo;
    private final TimeTrackingRepository timeRepo;
    private final BoardActivityRepository activityRepo;
    private final ApplicationEventPublisher eventPublisher;
    private final WorkflowEventPublisher workflowEventPublisher;
    private final NotificationService notificationService;

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
            CommentRepository commentRepo,
            AttachmentRepository attachmentRepo,
            TimeTrackingRepository timeRepo,
            BoardActivityRepository activityRepo,
            ApplicationEventPublisher eventPublisher,
            WorkflowEventPublisher workflowEventPublisher,
            NotificationService notificationService) {

        this.todoRepo = todoRepo;
        this.userRepo = userRepo;
        this.workspaceRepo = workspaceRepo;
        this.projectRepo = projectRepo;
        this.boardRepo = boardRepo;
        this.columnRepo = columnRepo;
        this.membershipRepo = membershipRepo;
        this.commentRepo = commentRepo;
        this.attachmentRepo = attachmentRepo;
        this.timeRepo = timeRepo;
        this.activityRepo = activityRepo;
        this.eventPublisher = eventPublisher;
        this.workflowEventPublisher = workflowEventPublisher;
        this.notificationService = notificationService;
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

        List<Todos> results = new ArrayList<>();

        // Apply filters based on parameters
        if (projectId != null) {
            Project project = projectRepo.findById(projectId)
                    .orElseThrow(() -> new RuntimeException("Project not found"));
            results = todoRepo.findByWorkspaceAndProject(workspace, project);
        }
        else if (priority != null) {
            Todos.Priority priorityEnum = Todos.Priority.valueOf(priority.toUpperCase());
            results = todoRepo.findByWorkspaceAndPriority(workspace, priorityEnum);
        }
        else if (status != null) {
            Todos.Status statusEnum = Todos.Status.valueOf(status.toUpperCase());
            results = todoRepo.findByWorkspaceAndStatus(workspace, statusEnum);
        }
        else if (assigneeId != null) {
            User assignee = userRepo.findById(assigneeId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            results = todoRepo.findByWorkspaceAndAssignedTo(workspace, assignee);
        }
        else if (dueDate != null) {
            results = todoRepo.findByWorkspaceAndDueDate(workspace, dueDate);
        }
        else if ("today".equals(filter)) {
            results = todoRepo.findByWorkspaceAndDueDate(workspace, LocalDate.now());
        }
        else if ("overdue".equals(filter)) {
            results = todoRepo.findOverdueInWorkspace(workspace, LocalDate.now());
        }
        else if ("completed".equals(filter)) {
            results = todoRepo.findByWorkspaceAndStatus(workspace, Todos.Status.COMPLETED);
        }
        else if ("pending".equals(filter)) {
            results = todoRepo.findByWorkspaceAndStatusNot(workspace, Todos.Status.COMPLETED);
        }
        else if ("assigned".equals(filter)) {
            results = todoRepo.findByWorkspaceAndAssignedTo(workspace, user);
        }
        else if ("created".equals(filter)) {
            results = todoRepo.findByWorkspaceAndCreatedBy(workspace, user);
        }
        else {
            results = todoRepo.findByWorkspace(workspace);
        }

        // Apply label filter if provided
        if (labels != null && !labels.isEmpty()) {
            results = results.stream()
                    .filter(todo -> todo.getLabels() != null &&
                            todo.getLabels().stream().anyMatch(labels::contains))
                    .collect(Collectors.toList());
        }

        // Apply pagination manually if needed
        if (page >= 0 && size > 0) {
            int start = page * size;
            int end = Math.min(start + size, results.size());
            if (start < results.size()) {
                results = results.subList(start, end);
            } else {
                results = new ArrayList<>();
            }
        }

        return results;
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

        // Validate due date (cannot be in the past for new tasks)
        LocalDateTime dueDateTime = request.getProcessedDueDateTime();
        if (dueDateTime != null && dueDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Due date cannot be in the past");
        }

        LocalDate dueDate = request.getDueDate();
        if (dueDate != null && dueDateTime == null) {
            // If only date provided, check if date is in past
            if (dueDate.isBefore(LocalDate.now())) {
                throw new IllegalArgumentException("Due date cannot be in the past");
            }
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

        // Find board if provided
        Board board = null;
        if (request.getBoardId() != null) {
            board = boardRepo.findById(request.getBoardId())
                    .orElseThrow(() -> new RuntimeException("Board not found"));
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
                BoardColumn defaultColumn = columnRepo.findByBoardAndType(board, BoardColumn.ColumnType.TODO)
                        .orElse(null);
                if (defaultColumn != null) {
                    todo.setBoardColumn(defaultColumn);
                    todo.setOrderIndex(defaultColumn.getTodos().size());
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

        // Send notifications
        if (assignedTo != null && !assignedTo.getId().equals(creator.getId())) {
            notificationService.sendTaskAssignedNotification(saved);
        }

        // Publish domain events
        saved.getDomainEvents().forEach(eventPublisher::publishEvent);
        saved.clearDomainEvents();

        log.info("Task created: {} by user: {}", saved.getId(), email);

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
        User oldAssignee = todo.getAssignedTo();

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
            }
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

        // Send notification if assignment changed
        if (assignmentChanged && saved.getAssignedTo() != null &&
                !saved.getAssignedTo().getId().equals(user.getId())) {
            notificationService.sendTaskAssignedNotification(saved);
        }

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

        // Apply status change using domain methods
        switch (newStatus) {
            case COMPLETED:
                todo.complete();
                // Send completion notification
                notificationService.sendTaskCompletedNotification(todo);
                break;
            case IN_PROGRESS:
                todo.start();
                break;
            case REVIEW:
                todo.moveToReview();
                break;
            case BLOCKED:
                todo.block("Status changed by user");
                break;
            case ARCHIVED:
                todo.archive();
                break;
            case PENDING:
                // If it was completed, un-complete
                if (todo.getStatus() == Todos.Status.COMPLETED) {
                    todo.setCompletedAt(null);
                }
                todo.setStatus(Todos.Status.PENDING);
                break;
            default:
                todo.setStatus(newStatus);
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
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        User user = getUserByEmail(email);

        // Use findByIdIncludeDeleted to find even soft-deleted tasks
        Todos todo = todoRepo.findByIdIncludeDeleted(id)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (permanent) {
            // Permanent delete - remove all related data
            commentRepo.deleteByTodo(todo);
            attachmentRepo.deleteByTodo(todo);
            timeRepo.deleteByTodo(todo);
            todoRepo.delete(todo);
            log.info("Task permanently deleted: {} by user: {}", id, email);
        } else {
            // Soft delete
            todo.softDelete();
            todoRepo.save(todo);
            todoRepo.flush();          // Force SQL execution
            entityManager.clear();      // Evict all entities from persistence context
            log.info("Task soft deleted: {} by user: {}", id, email);
        }

        // Record activity
        if (todo.getBoard() != null) {
            BoardActivity activity = new BoardActivity();
            activity.setType(permanent ? BoardActivity.ActivityType.TASK_DELETED :
                    BoardActivity.ActivityType.TASK_ARCHIVED);
            activity.setBoard(todo.getBoard());
            activity.setTodo(todo);
            activity.setPerformedBy(user);
            activity.setDescription(String.format("Task '%s' %s",
                    todo.getItem(), permanent ? "permanently deleted" : "archived"));
            activityRepo.save(activity);
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
        User user = getUserByEmail(email);

        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        Comment comment = new Comment();
        comment.setContent(content);
        comment.setTodo(todo);
        comment.setAuthor(user);

        Comment saved = commentRepo.save(comment);

        // Record activity
        if (todo.getBoard() != null) {
            BoardActivity activity = BoardActivity.commentAdded(todo, saved, user);
            activityRepo.save(activity);
        }

        log.info("Comment added to task: {} by user: {}", todoId, email);

        return saved;
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

        return commentRepo.findByTodoOrderByCreatedAtDesc(todo);
    }

    // Time tracking methods
    @WorkspaceAccess
    @Transactional
    public TimeTracking startTimeTracking(Long todoId, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);
        User user = getUserByEmail(email);

        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        if (!todo.getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        // Check if already tracking
        if (timeRepo.findByUserAndEndTimeIsNull(user).isPresent()) {
            throw new RuntimeException("You already have an active timer");
        }

        TimeTracking tracking = new TimeTracking();
        tracking.setTodo(todo);
        tracking.setUser(user);
        tracking.setStartTime(LocalDateTime.now());

        TimeTracking saved = timeRepo.save(tracking);

        log.info("Timer started for task: {} by user: {}", todoId, email);

        return saved;
    }
    @WorkspaceAccess
    @Transactional
    public TimeTracking stopTimeTracking(Long trackingId, String email) {
        Workspace workspace = getCurrentWorkspace();
        validateWorkspaceAccess(workspace, email);

        TimeTracking tracking = timeRepo.findById(trackingId)
                .orElseThrow(() -> new RuntimeException("Time tracking not found"));

        if (!tracking.getTodo().getWorkspace().getId().equals(workspace.getId())) {
            throw new RuntimeException("Access denied");
        }

        if (!tracking.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You can only stop your own timers");
        }

        tracking.stop();
        TimeTracking saved = timeRepo.save(tracking);

        // Add actual hours to todo
        Todos todo = tracking.getTodo();
        if (saved.getHoursLogged() != null) {
            todo.addTimeSpent(saved.getHoursLogged().intValue());
            todoRepo.save(todo);
        }

        return saved;
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

        return timeRepo.findByTodo(todo);
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

        return timeRepo.totalHoursForTodo(todo);
    }
}