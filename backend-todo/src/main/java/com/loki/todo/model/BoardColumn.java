// com/loki/todo/model/BoardColumn.java
package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@Table(name = "board_columns")
public class BoardColumn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private double orderIndex;

    @Enumerated(EnumType.STRING)
    private ColumnType type = ColumnType.CUSTOM;

    @Column(name = "wip_limit")
    private Integer wipLimit = 0;

    @Column(name = "color")
    private String color = "#6b7280";

    @ManyToOne
    @JoinColumn(name = "board_id", nullable = false)
    private Board board;

    @OneToMany(mappedBy = "boardColumn", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<Todos> todos = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum ColumnType {
        TODO, IN_PROGRESS, REVIEW, DONE, CUSTOM
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

    public boolean canAddTodo() {
        return wipLimit == null || wipLimit == 0 || todos.size() < wipLimit;
    }

    public void addTodo(Todos todo) {
        if (!canAddTodo()) {
            throw new IllegalStateException("Column has reached WIP limit of " + wipLimit);
        }
        todo.setBoardColumn(this);
        todo.setOrderIndex(todos.size());
        this.todos.add(todo);
    }

    public void removeTodo(Todos todo) {
        this.todos.remove(todo);
        todo.setBoardColumn(null);
        for (int i = 0; i < todos.size(); i++) {
            todos.get(i).setOrderIndex(i);
        }
    }

    public void reorderTodos(int oldIndex, int newIndex) {
        if (oldIndex < 0 || oldIndex >= todos.size() || newIndex < 0 || newIndex >= todos.size()) {
            throw new IllegalArgumentException("Invalid indices");
        }
        Todos movedTodo = todos.remove(oldIndex);
        todos.add(newIndex, movedTodo);
        for (int i = 0; i < todos.size(); i++) {
            todos.get(i).setOrderIndex(i);
        }
    }

    public void softDelete() {
        this.deletedAt = LocalDateTime.now();
    }
}