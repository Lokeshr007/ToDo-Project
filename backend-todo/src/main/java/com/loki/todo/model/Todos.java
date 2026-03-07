package com.loki.todo.model;

import com.loki.todo.workflow.WorkflowEvent;
import com.loki.todo.workflow.WorkflowEventType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "todos", indexes = {
        @Index(name = "idx_todos_workspace", columnList = "workspace_id"),
        @Index(name = "idx_todos_status", columnList = "status"),
        @Index(name = "idx_todos_due_date", columnList = "due_date"),
        @Index(name = "idx_todos_assigned", columnList = "assigned_to_id"),
        @Index(name = "idx_todos_deleted", columnList = "deleted_at")
})
@SQLRestriction("deleted_at IS NULL")
public class Todos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String item;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status = Status.PENDING;

    @Enumerated(EnumType.STRING)
    private Priority priority = Priority.NORMAL;

    private LocalDate dueDate;

    private LocalDateTime dueDateTime;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "estimated_hours")
    private Integer estimatedHours;

    @Column(name = "actual_hours")
    private Double actualHours;

    @Column(name = "story_points")
    private Integer storyPoints;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "is_ai_generated")
    private Boolean isAiGenerated = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false)
    private User createdBy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_to_id")
    private User assignedTo;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "todo_assignees",
            joinColumns = @JoinColumn(name = "todo_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private List<User> assignees = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_column_id")
    private BoardColumn boardColumn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "goal_id")
    private Goal goal;

    @Column(name = "ai_score")
    private Double aiScore;

    @Column(name = "progress")
    private Integer progress = 0;

    @Column(name = "order_index")
    private double orderIndex = 0;

    @ElementCollection
    @CollectionTable(name = "todo_labels", joinColumns = @JoinColumn(name = "todo_id"))
    @Column(name = "label")
    private List<String> labels = new ArrayList<>();

    @OneToMany(mappedBy = "todo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "todo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "todo", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TimeTracking> timeEntries = new ArrayList<>();

    @Version
    private Long version;

    @Transient
    private List<Object> domainEvents = new ArrayList<>();

    public enum Status {
        PENDING, IN_PROGRESS, REVIEW, COMPLETED, BLOCKED, BACKLOG, ARCHIVED
    }

    public enum Priority {
        HIGH, MEDIUM, NORMAL, LOW
    }

    // ========== CONSTRUCTORS ==========

    // Constructor 1: Basic (3 parameters)
    public Todos(String item, Workspace workspace, User creator) {
        this.item = item;
        this.workspace = workspace;
        this.createdBy = creator;
        this.status = Status.PENDING;
        this.priority = Priority.NORMAL;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor 2: With description but minimal (4 parameters)
    public Todos(String item, String description, Workspace workspace, User creator) {
        this.item = item;
        this.description = description;
        this.workspace = workspace;
        this.createdBy = creator;
        this.status = Status.PENDING;
        this.priority = Priority.NORMAL;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    // Constructor 3: Full with dueDateTime (10 parameters)
    public Todos(String item, String description, Workspace workspace, User creator,
                 Priority priority, LocalDate dueDate, LocalDateTime dueDateTime,
                 Project project, User assignedTo, Integer storyPoints) {
        this.item = item;
        this.description = description;
        this.workspace = workspace;
        this.createdBy = creator;
        this.assignedTo = assignedTo;
        this.project = project;
        this.status = Status.PENDING;
        this.priority = priority != null ? priority : Priority.NORMAL;
        this.dueDate = dueDate;
        this.dueDateTime = dueDateTime;
        this.storyPoints = storyPoints;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_CREATED, this));
    }

    // Constructor 4: Full without dueDateTime (9 parameters)
    public Todos(String item, String description, Workspace workspace, User creator,
                 Priority priority, LocalDate dueDate, Project project,
                 User assignedTo, Integer storyPoints) {
        this.item = item;
        this.description = description;
        this.workspace = workspace;
        this.createdBy = creator;
        this.assignedTo = assignedTo;
        this.project = project;
        this.status = Status.PENDING;
        this.priority = priority != null ? priority : Priority.NORMAL;
        this.dueDate = dueDate;
        this.dueDateTime = null;
        this.storyPoints = storyPoints;
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();

        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_CREATED, this));
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Domain methods
    public void complete() {
        if (this.status == Status.COMPLETED) {
            throw new IllegalStateException("Already completed");
        }
        this.status = Status.COMPLETED;
        this.completedAt = LocalDateTime.now();
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_COMPLETED, this));
    }

    public void start() {
        if (this.status != Status.PENDING) {
            throw new IllegalStateException("Can only start pending tasks");
        }
        this.status = Status.IN_PROGRESS;
        this.startedAt = LocalDateTime.now();
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_STARTED, this));
    }

    public void moveToReview() {
        if (this.status != Status.IN_PROGRESS) {
            throw new IllegalStateException("Can only move in-progress tasks to review");
        }
        this.status = Status.REVIEW;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_MOVED_TO_REVIEW, this));
    }

    public void block(String reason) {
        this.status = Status.BLOCKED;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_BLOCKED, this, reason));
    }

    public void unblock() {
        if (this.status != Status.BLOCKED) {
            throw new IllegalStateException("Task is not blocked");
        }
        this.status = Status.IN_PROGRESS;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_UNBLOCKED, this));
    }

    public void updateItem(String newItem) {
        if (newItem == null || newItem.trim().isEmpty()) {
            throw new IllegalArgumentException("Item cannot be empty");
        }
        this.item = newItem;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_UPDATED, this));
    }

    public void updateDescription(String newDescription) {
        this.description = newDescription;
    }

    public void assignTo(User user) {
        User previousAssignee = this.assignedTo;
        this.assignedTo = user;
        if (user != null && !this.assignees.contains(user)) {
            this.assignees.add(user);
        }
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_ASSIGNED, this, previousAssignee, user));
    }

    public void addAssignee(User user) {
        if (user != null && !this.assignees.contains(user)) {
            this.assignees.add(user);
            domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_ASSIGNED, this, null, user));
        }
    }

    public void removeAssignee(User user) {
        if (this.assignees.remove(user)) {
            if (this.assignedTo != null && this.assignedTo.equals(user)) {
                this.assignedTo = this.assignees.isEmpty() ? null : this.assignees.get(0);
            }
            domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_UNASSIGNED, this, user, null));
        }
    }

    public void changePriority(Priority newPriority) {
        Priority previousPriority = this.priority;
        this.priority = newPriority;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_PRIORITY_CHANGED, this, previousPriority, newPriority));
    }

    public void setDueDate(LocalDate newDueDate, LocalDateTime newDueDateTime) {
        LocalDate previousDueDate = this.dueDate;
        LocalDateTime previousDueDateTime = this.dueDateTime;
        this.dueDate = newDueDate;
        this.dueDateTime = newDueDateTime;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_DUE_DATE_CHANGED, this, previousDueDate, newDueDate));
    }

    public void moveToProject(Project newProject) {
        Project previousProject = this.project;
        this.project = newProject;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_MOVED, this, previousProject, newProject));
    }

    public void moveToBoard(Board newBoard) {
        this.board = newBoard;
    }

    public void moveToColumn(BoardColumn newColumn) {
        BoardColumn previousColumn = this.boardColumn;
        this.boardColumn = newColumn;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_MOVED_COLUMN, this, previousColumn, newColumn));
    }

    public void addLabel(String label) {
        if (!this.labels.contains(label)) {
            this.labels.add(label);
        }
    }

    public void removeLabel(String label) {
        this.labels.remove(label);
    }

    public void addTimeSpent(Double hours) {
        if (this.actualHours == null) {
            this.actualHours = 0.0;
        }
        this.actualHours += hours;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_TIME_LOGGED, this, hours));
    }

    public boolean isOverdue() {
        if (dueDate == null && dueDateTime == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();

        if (dueDateTime != null) {
            return status != Status.COMPLETED &&
                    status != Status.ARCHIVED &&
                    deletedAt == null &&
                    dueDateTime.isBefore(now);
        } else if (dueDate != null) {
            return status != Status.COMPLETED &&
                    status != Status.ARCHIVED &&
                    deletedAt == null &&
                    dueDate.isBefore(now.toLocalDate());
        }

        return false;
    }

    public void archive() {
        this.status = Status.ARCHIVED;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_ARCHIVED, this));
    }

    public void restore() {
        if (this.status != Status.ARCHIVED) {
            throw new IllegalStateException("Task is not archived");
        }
        this.status = Status.PENDING;
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_RESTORED, this));
    }

    // Soft delete methods
    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
        domainEvents.add(new WorkflowEvent(WorkflowEventType.TODO_DELETED, this));
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }

    public void clearDomainEvents() {
        domainEvents.clear();
    }

    // Helper method to check if due date is valid (not in past for new tasks)
    public static boolean isValidDueDate(LocalDate dueDate, boolean isNewTask) {
        if (dueDate == null) return true;
        if (!isNewTask) return true;
        return !dueDate.isBefore(LocalDate.now());
    }

    public static boolean isValidDueDateTime(LocalDateTime dueDateTime, boolean isNewTask) {
        if (dueDateTime == null) return true;
        if (!isNewTask) return true;
        return !dueDateTime.isBefore(LocalDateTime.now());
    }
}