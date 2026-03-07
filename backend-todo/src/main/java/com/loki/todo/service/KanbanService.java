package com.loki.todo.service;

import com.loki.todo.dto.*;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import com.loki.todo.security.WorkspaceAccess;
import com.loki.todo.security.WorkspaceContext;
import com.loki.todo.workflow.WorkflowEvent;
import com.loki.todo.workflow.WorkflowEventPublisher;
import com.loki.todo.workflow.WorkflowEventType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class KanbanService {

    private final BoardRepository boardRepo;
    private final BoardColumnRepository columnRepo;
    private final BoardActivityRepository activityRepo;
    private final TodosRepository todoRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;
    private final WorkspaceRepository workspaceRepo;
    private final MembershipRepository membershipRepo;
    private final ApplicationEventPublisher eventPublisher;
    private final WorkflowEventPublisher workflowEventPublisher;

    public KanbanService(
            BoardRepository boardRepo,
            BoardColumnRepository columnRepo,
            BoardActivityRepository activityRepo,
            TodosRepository todoRepo,
            ProjectRepository projectRepo,
            UserRepository userRepo,
            WorkspaceRepository workspaceRepo,
            MembershipRepository membershipRepo,
            ApplicationEventPublisher eventPublisher,
            WorkflowEventPublisher workflowEventPublisher) {

        this.boardRepo = boardRepo;
        this.columnRepo = columnRepo;
        this.activityRepo = activityRepo;
        this.todoRepo = todoRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.workspaceRepo = workspaceRepo;
        this.membershipRepo = membershipRepo;
        this.eventPublisher = eventPublisher;
        this.workflowEventPublisher = workflowEventPublisher;
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

    private void validateBoardAccess(Board board, String email) {
        User user = getUserByEmail(email);
        Workspace workspace = board.getProject().getWorkspace();

        if (!membershipRepo.existsByUserAndWorkspace(user, workspace)) {
            throw new RuntimeException("Access denied to this board");
        }
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public BoardDetailsDTO getBoardDetails(Long boardId, String email) {
        Board board = boardRepo.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        validateBoardAccess(board, email);

        // Get columns with todos
        List<BoardColumn> columns = columnRepo.findByBoardWithTodos(board);
        List<BoardColumnDTO> columnDTOs = columns.stream()
                .map(BoardColumnDTO::fromEntity)
                .collect(Collectors.toList());

        // Get recent activity
        List<BoardActivity> activities = activityRepo.findByBoardOrderByTimestampDesc(
                board, PageRequest.of(0, 30)
        );
        List<BoardActivityDTO> activityDTOs = activities.stream()
                .map(BoardActivityDTO::fromEntity)
                .collect(Collectors.toList());

        // Calculate stats
        BoardStatsDTO stats = calculateBoardStats(board, columns);

        return BoardDetailsDTO.fromEntity(board, columnDTOs, activityDTOs, stats);
    }

    private BoardStatsDTO calculateBoardStats(Board board, List<BoardColumn> columns) {
        BoardStatsDTO stats = new BoardStatsDTO();

        long totalTasks = 0;
        long completedTasks = 0;
        long overdueTasks = 0;
        long inProgressTasks = 0;
        long pendingTasks = 0;
        long blockedTasks = 0;
        long totalMovements = 0;
        long totalLeadTime = 0;
        long completedCount = 0;

        for (BoardColumn column : columns) {
            totalTasks += column.getTodos().size();

            for (Todos todo : column.getTodos()) {
                if (todo.getStatus() == Todos.Status.COMPLETED) {
                    completedTasks++;
                    completedCount++;
                    if (todo.getCreatedAt() != null && todo.getCompletedAt() != null) {
                        totalLeadTime += java.time.Duration.between(
                                todo.getCreatedAt(), todo.getCompletedAt()).toHours();
                    }
                } else if (todo.getStatus() == Todos.Status.IN_PROGRESS) {
                    inProgressTasks++;
                } else if (todo.getStatus() == Todos.Status.PENDING ||
                        todo.getStatus() == Todos.Status.BACKLOG) {
                    pendingTasks++;
                } else if (todo.getStatus() == Todos.Status.BLOCKED) {
                    blockedTasks++;
                }

                if (todo.isOverdue()) {
                    overdueTasks++;
                }
            }
        }

        stats.setTotalTasks(totalTasks);
        stats.setCompletedTasks(completedTasks);
        stats.setOverdueTasks(overdueTasks);
        stats.setInProgressTasks(inProgressTasks);
        stats.setPendingTasks(pendingTasks);
        stats.setBlockedTasks(blockedTasks);
        stats.setCompletionRate(totalTasks > 0 ? (completedTasks * 100.0 / totalTasks) : 0);

        totalMovements = activityRepo.countMovements(board);
        stats.setTotalMovements(totalMovements);

        // Average lead time (time from creation to completion)
        if (completedCount > 0) {
            stats.setAverageLeadTime(totalLeadTime / completedCount);
        } else {
            stats.setAverageLeadTime(0L);
        }

        // Average cycle time (time from start to completion) - would need additional tracking
        stats.setAverageCycleTime(0L);

        return stats;
    }

    @WorkspaceAccess
    @Transactional
    public BoardColumnDTO createColumn(Long boardId, String name, String description,
                                       String type, Integer wipLimit, String color,
                                       String email) {
        Board board = boardRepo.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        validateBoardAccess(board, email);
        User user = getUserByEmail(email);

        // Check if column with same name exists
        if (columnRepo.existsByBoardAndNameAndDeletedAtIsNull(board, name)) {
            throw new RuntimeException("Column with this name already exists");
        }

        double maxOrder = columnRepo.findMaxOrderIndex(board).orElse(-1.0);

        BoardColumn column = new BoardColumn();
        column.setName(name);
        column.setDescription(description);
        column.setBoard(board);
        column.setOrderIndex(maxOrder + 1.0);
        column.setCreatedBy(user);
        column.setColor(color);

        if (type != null) {
            try {
                column.setType(BoardColumn.ColumnType.valueOf(type.toUpperCase()));
            } catch (IllegalArgumentException e) {
                column.setType(BoardColumn.ColumnType.CUSTOM);
            }
        } else {
            column.setType(BoardColumn.ColumnType.CUSTOM);
        }

        if (wipLimit != null && wipLimit > 0) {
            column.setWipLimit(wipLimit);
        }

        BoardColumn savedColumn = columnRepo.save(column);

        // Record activity
        BoardActivity activity = new BoardActivity();
        activity.setType(BoardActivity.ActivityType.COLUMN_ADDED);
        activity.setBoard(board);
        activity.setPerformedBy(user);
        activity.setDescription(String.format("Column '%s' added to board", name));
        activity.setTimestamp(LocalDateTime.now());
        activityRepo.save(activity);

        // Publish event
        workflowEventPublisher.publish(new WorkflowEvent(
                WorkflowEventType.BOARD_COLUMN_ADDED,
                null,
                board,
                savedColumn
        ));

        log.info("Column created: {} in board: {} by user: {}",
                savedColumn.getId(), boardId, email);

        return BoardColumnDTO.fromEntity(savedColumn);
    }

    @WorkspaceAccess
    @Transactional
    public BoardColumnDTO updateColumn(Long columnId, String name, String description,
                                       Integer wipLimit, String color, String email) {
        BoardColumn column = columnRepo.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        validateBoardAccess(column.getBoard(), email);
        User user = getUserByEmail(email);

        StringBuilder changes = new StringBuilder();

        if (name != null && !name.trim().isEmpty() && !name.equals(column.getName())) {
            column.setName(name);
            changes.append("name, ");
        }

        if (description != null) {
            column.setDescription(description);
            changes.append("description, ");
        }

        if (wipLimit != null && wipLimit > 0 && !wipLimit.equals(column.getWipLimit())) {
            column.setWipLimit(wipLimit);
            changes.append("WIP limit, ");
        }

        if (color != null && !color.equals(column.getColor())) {
            column.setColor(color);
            changes.append("color, ");
        }

        BoardColumn savedColumn = columnRepo.save(column);

        // Record activity if changes made
        if (changes.length() > 0) {
            BoardActivity activity = new BoardActivity();
            activity.setType(BoardActivity.ActivityType.COLUMN_RENAMED);
            activity.setBoard(column.getBoard());
            activity.setPerformedBy(user);
            activity.setDescription(String.format("Column updated: %s",
                    changes.substring(0, changes.length() - 2)));
            activityRepo.save(activity);
        }

        // Publish event
        workflowEventPublisher.publish(new WorkflowEvent(
                WorkflowEventType.BOARD_COLUMN_RENAMED,
                null,
                column.getBoard(),
                savedColumn
        ));

        log.info("Column updated: {} by user: {}", columnId, email);

        return BoardColumnDTO.fromEntity(savedColumn);
    }

    @WorkspaceAccess
    @Transactional
    public void deleteColumn(Long columnId, Long moveToColumnId, String email) {
        BoardColumn column = columnRepo.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        validateBoardAccess(column.getBoard(), email);
        User user = getUserByEmail(email);

        if (!column.getTodos().isEmpty()) {
            if (moveToColumnId == null) {
                throw new RuntimeException("Cannot delete column with tasks. Please move tasks first.");
            }

            BoardColumn targetColumn = columnRepo.findById(moveToColumnId)
                    .orElseThrow(() -> new RuntimeException("Target column not found"));

            // Move all tasks to target column
            for (Todos todo : column.getTodos()) {
                todo.moveToColumn(targetColumn);
                targetColumn.getTodos().add(todo);
            }
            column.getTodos().clear();
            columnRepo.save(targetColumn);
        }

        // Soft delete
        column.softDelete();
        columnRepo.save(column);

        // Record activity
        BoardActivity activity = new BoardActivity();
        activity.setType(BoardActivity.ActivityType.COLUMN_DELETED);
        activity.setBoard(column.getBoard());
        activity.setPerformedBy(user);
        activity.setDescription(String.format("Column '%s' deleted", column.getName()));
        activityRepo.save(activity);

        // Publish event
        workflowEventPublisher.publish(new WorkflowEvent(
                WorkflowEventType.BOARD_COLUMN_DELETED,
                null,
                column.getBoard(),
                column
        ));

        log.info("Column deleted: {} from board: {} by user: {}",
                columnId, column.getBoard().getId(), email);
    }

    @WorkspaceAccess
    @Transactional
    public TodoCardDTO moveTask(BoardMoveDTO moveDTO, String email) {
        Todos todo = todoRepo.findById(moveDTO.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found"));

        validateBoardAccess(todo.getBoard(), email);
        User user = getUserByEmail(email);

        BoardColumn fromColumn = columnRepo.findById(moveDTO.getFromColumnId())
                .orElseThrow(() -> new RuntimeException("Source column not found"));

        BoardColumn toColumn = columnRepo.findById(moveDTO.getToColumnId())
                .orElseThrow(() -> new RuntimeException("Destination column not found"));

        // Check WIP limit
        if (!toColumn.canAddTodo()) {
            throw new RuntimeException("Destination column has reached its WIP limit of " + toColumn.getWipLimit());
        }

        // Remove from source column
        fromColumn.getTodos().remove(todo);

        // Add to destination column at specified index
        if (moveDTO.getNewIndex() != null && moveDTO.getNewIndex() <= toColumn.getTodos().size()) {
            toColumn.getTodos().add(moveDTO.getNewIndex(), todo);
        } else {
            toColumn.getTodos().add(todo);
        }

        // Update order indices
        for (int i = 0; i < toColumn.getTodos().size(); i++) {
            toColumn.getTodos().get(i).setOrderIndex(i);
        }

        todo.setBoardColumn(toColumn);

        // Update status based on column type
        if (toColumn.getType() == BoardColumn.ColumnType.DONE) {
            todo.complete();
        } else if (toColumn.getType() == BoardColumn.ColumnType.IN_PROGRESS &&
                (todo.getStatus() == Todos.Status.BACKLOG ||
                        todo.getStatus() == Todos.Status.PENDING)) {
            todo.start();
        } else if (toColumn.getType() == BoardColumn.ColumnType.REVIEW) {
            todo.moveToReview();
        }

        Todos savedTodo = todoRepo.save(todo);
        columnRepo.save(fromColumn);
        columnRepo.save(toColumn);

        // Record activity
        BoardActivity activity = BoardActivity.taskMoved(
                todo.getBoard(), todo, fromColumn, toColumn, user
        );
        activity.setTimestamp(LocalDateTime.now());
        activityRepo.save(activity);

        // Publish workflow event
        workflowEventPublisher.publish(new WorkflowEvent(
                WorkflowEventType.TODO_MOVED_COLUMN,
                savedTodo,
                fromColumn,
                toColumn
        ));

        log.info("Task moved: {} from column {} to {} by user: {}",
                moveDTO.getTaskId(), fromColumn.getId(), toColumn.getId(), email);

        return TodoCardDTO.fromEntity(savedTodo);
    }

    @WorkspaceAccess
    @Transactional
    public void reorderColumns(Long boardId, List<Long> columnIds, String email) {
        Board board = boardRepo.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        validateBoardAccess(board, email);
        User user = getUserByEmail(email);

        for (int i = 0; i < columnIds.size(); i++) {
            BoardColumn column = columnRepo.findById(columnIds.get(i))
                    .orElseThrow(() -> new RuntimeException("Column not found"));
            column.setOrderIndex((double) i);
            columnRepo.save(column);
        }

        // Record activity
        BoardActivity activity = new BoardActivity();
        activity.setType(BoardActivity.ActivityType.COLUMN_MOVED);
        activity.setBoard(board);
        activity.setPerformedBy(user);
        activity.setDescription("Columns reordered");
        activityRepo.save(activity);

        log.info("Columns reordered in board: {} by user: {}", boardId, email);
    }

    @WorkspaceAccess
    @Transactional
    public TodoCardDTO createTaskInColumn(Long columnId, TodoRequest request, String email) {
        BoardColumn column = columnRepo.findById(columnId)
                .orElseThrow(() -> new RuntimeException("Column not found"));

        validateBoardAccess(column.getBoard(), email);
        User creator = getUserByEmail(email);

        if (!column.canAddTodo()) {
            throw new RuntimeException("Column has reached its WIP limit of " + column.getWipLimit());
        }

        Todos.Priority priority = request.getPriorityEnum() != null ?
                request.getPriorityEnum() : Todos.Priority.MEDIUM;

        String itemTitle = request.getItem();
        if (itemTitle != null && itemTitle.length() > 1000) {
            itemTitle = itemTitle.substring(0, 995) + "...";
        }

        Todos todo = new Todos(
                itemTitle,
                request.getDescription(),
                column.getBoard().getProject().getWorkspace(),
                creator,
                priority,
                request.getDueDate(),
                column.getBoard().getProject(),
                request.getAssignedUserId() != null ?
                        userRepo.findById(request.getAssignedUserId()).orElse(null) : null,
                request.getStoryPoints()
        );

        // Process multiple assignees
        if (request.getAssigneeIds() != null && !request.getAssigneeIds().isEmpty()) {
            for (Long assigneeId : request.getAssigneeIds()) {
                userRepo.findById(assigneeId).ifPresent(user -> {
                    if (membershipRepo.existsByUserAndWorkspace(user, column.getBoard().getProject().getWorkspace())) {
                        todo.addAssignee(user);
                    }
                });
            }
        } else if (todo.getAssignedTo() != null) {
            // If only single assignedTo exists, add it to assignees as well
            todo.addAssignee(todo.getAssignedTo());
        }

        todo.setBoard(column.getBoard());
        todo.setBoardColumn(column);
        todo.setOrderIndex(column.getTodos().size());

        Todos savedTodo = todoRepo.save(todo);
        column.getTodos().add(savedTodo);
        columnRepo.save(column);

        // Record activity
        BoardActivity activity = BoardActivity.taskCreated(column.getBoard(), savedTodo, creator);
        activity.setTimestamp(LocalDateTime.now());
        activityRepo.save(activity);

        // Publish event
        workflowEventPublisher.publish(new WorkflowEvent(
                WorkflowEventType.TODO_CREATED,
                savedTodo,
                column
        ));

        log.info("Task created in column: {} by user: {}", columnId, email);

        return TodoCardDTO.fromEntity(savedTodo);
    }

    @WorkspaceAccess
    @Transactional
    public TodoCardDTO updateTaskAssignees(Long taskId, List<Long> userIds, String email) {
        Todos todo = todoRepo.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Task not found"));

        validateBoardAccess(todo.getBoard(), email);
        User performer = getUserByEmail(email);

        List<User> newAssignees = userRepo.findAllById(userIds);
        
        // Remove old assignees
        todo.getAssignees().clear();
        
        // Add new assignees
        todo.getAssignees().addAll(newAssignees);
        
        // Also update the primary assignedTo for backward compatibility
        if (!newAssignees.isEmpty()) {
            todo.setAssignedTo(newAssignees.get(0));
        } else {
            todo.setAssignedTo(null);
        }

        Todos savedTodo = todoRepo.save(todo);

        // Record activity
        BoardActivity activity = new BoardActivity();
        activity.setType(BoardActivity.ActivityType.TASK_UPDATED);
        activity.setBoard(todo.getBoard());
        activity.setPerformedBy(performer);
        activity.setTodo(todo);
        activity.setDescription(String.format("Assignees updated for task: %s", todo.getItem()));
        activityRepo.save(activity);

        return TodoCardDTO.fromEntity(savedTodo);
    }

    @WorkspaceAccess
    @Transactional(readOnly = true)
    public List<BoardActivityDTO> getBoardActivity(Long boardId, int limit, String email) {
        Board board = boardRepo.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        validateBoardAccess(board, email);

        List<BoardActivity> activities = activityRepo.findByBoardOrderByTimestampDesc(
                board, PageRequest.of(0, limit)
        );

        return activities.stream()
                .map(BoardActivityDTO::fromEntity)
                .collect(Collectors.toList());
    }
}