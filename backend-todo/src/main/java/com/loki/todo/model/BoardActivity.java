package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "board_activities", indexes = {
        @Index(name = "idx_board_activities_board", columnList = "board_id"),
        @Index(name = "idx_board_activities_timestamp", columnList = "timestamp")
})
public class BoardActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private ActivityType type;

    private String description;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Board board;

    @ManyToOne
    private BoardColumn sourceColumn;

    @ManyToOne
    private BoardColumn targetColumn;

    @ManyToOne
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Todos todo;

    @ManyToOne
    private User performedBy;

    private LocalDateTime timestamp;

    @Column(length = 500)
    private String metadata;

    @Column(name = "old_value")
    private String oldValue;

    @Column(name = "new_value")
    private String newValue;

    public enum ActivityType {
        TASK_CREATED,
        TASK_MOVED,
        TASK_COMPLETED,
        TASK_UPDATED,
        TASK_DELETED,
        TASK_ARCHIVED,
        TASK_RESTORED,
        TASK_ASSIGNED,
        TASK_PRIORITY_CHANGED,
        TASK_DUE_DATE_CHANGED,
        TASK_COMMENT_ADDED,
        TASK_ATTACHMENT_ADDED,
        COLUMN_ADDED,
        COLUMN_RENAMED,
        COLUMN_DELETED,
        COLUMN_MOVED,
        BOARD_CREATED,
        BOARD_RENAMED
    }

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }

    public static BoardActivity taskMoved(Board board, Todos todo, BoardColumn from, BoardColumn to, User user) {
        BoardActivity activity = new BoardActivity();
        activity.setType(ActivityType.TASK_MOVED);
        activity.setBoard(board);
        activity.setTodo(todo);
        activity.setSourceColumn(from);
        activity.setTargetColumn(to);
        activity.setPerformedBy(user);
        activity.setDescription(String.format("Task '%s' moved from '%s' to '%s'",
                todo.getItem(), from.getName(), to.getName()));
        return activity;
    }

    public static BoardActivity taskCreated(Board board, Todos todo, User user) {
        BoardActivity activity = new BoardActivity();
        activity.setType(ActivityType.TASK_CREATED);
        activity.setBoard(board);
        activity.setTodo(todo);
        activity.setPerformedBy(user);
        activity.setDescription(String.format("Task '%s' created", todo.getItem()));
        return activity;
    }

    public static BoardActivity taskAssigned(Todos todo, User assignee, User user) {
        BoardActivity activity = new BoardActivity();
        activity.setType(ActivityType.TASK_ASSIGNED);
        activity.setBoard(todo.getBoard());
        activity.setTodo(todo);
        activity.setPerformedBy(user);
        activity.setDescription(String.format("Task '%s' assigned to %s",
                todo.getItem(), assignee.getName()));
        return activity;
    }

    public static BoardActivity commentAdded(Todos todo, Comment comment, User user) {
        BoardActivity activity = new BoardActivity();
        activity.setType(ActivityType.TASK_COMMENT_ADDED);
        activity.setBoard(todo.getBoard());
        activity.setTodo(todo);
        activity.setPerformedBy(user);
        activity.setDescription(String.format("Comment added to task '%s'", todo.getItem()));
        activity.setMetadata(comment.getContent());
        return activity;
    }
}