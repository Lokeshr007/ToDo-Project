// com/loki/todo/model/Board.java
package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "boards")
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    private String color = "#6366f1";

    private double orderIndex;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Todos> todos = new ArrayList<>();

    @OneToMany(mappedBy = "board", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    private List<BoardColumn> columns = new ArrayList<>();

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Todos addTodo(String item, String description, Workspace workspace, User creator,
                         Todos.Priority priority, LocalDate dueDate, LocalDateTime dueDateTime,
                         Project project, User assignedTo, Integer storyPoints) {

        Todos todo = new Todos(item, description, workspace, creator, priority,
                dueDate, dueDateTime, project, assignedTo, storyPoints);

        todo.setBoard(this);
        this.todos.add(todo);
        return todo;
    }

    public Todos addTodo(String item, Workspace workspace, User creator) {
        Todos todo = new Todos(item, workspace, creator);
        todo.setBoard(this);
        this.todos.add(todo);
        return todo;
    }

    public void completeTodo(Long todoId) {
        Todos todo = this.todos.stream()
                .filter(t -> t.getId().equals(todoId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Todo not found in board"));
        todo.complete();
    }

    public void removeTodo(Long todoId) {
        this.todos.removeIf(t -> t.getId().equals(todoId));
    }

    public void addColumn(BoardColumn column) {
        column.setBoard(this);
        column.setOrderIndex(columns.size());
        this.columns.add(column);
    }

    public void removeColumn(Long columnId) {
        this.columns.removeIf(col -> col.getId().equals(columnId));
    }

    public int getTotalTasks() {
        return todos.size();
    }

    public long getCompletedTasks() {
        return todos.stream()
                .filter(t -> t.getStatus() == Todos.Status.COMPLETED)
                .count();
    }

    public double getCompletionPercentage() {
        if (todos.isEmpty()) return 0;
        return (getCompletedTasks() * 100.0) / todos.size();
    }
}