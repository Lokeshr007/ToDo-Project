package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // TASK_ASSIGNED, TASK_COMPLETED, MENTION, etc.

    private String title;

    @Column(length = 500)
    private String message;

    private boolean read = false;

    private String actionUrl; // Link to navigate when clicked

    private String icon; // lucide icon name

    private String color; // color class or hex

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @ManyToOne
    @JoinColumn(name = "todo_id")
    private Todos todo;

    @ManyToOne
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "metadata", length = 1000)
    private String metadata; // JSON string for additional data

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}