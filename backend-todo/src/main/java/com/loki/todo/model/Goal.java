package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "goals")
@Data
@NoArgsConstructor
public class Goal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private String type; // daily, weekly, monthly, custom

    @Column(nullable = false)
    private Integer target;

    private String unit; // tasks, hours, pages, etc.

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    private Integer progress = 0;

    @ElementCollection
    @CollectionTable(name = "goal_completed_dates",
            joinColumns = @JoinColumn(name = "goal_id"))
    @Column(name = "completed_date")
    private List<LocalDate> completedDates = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "goal_linked_tasks",
            joinColumns = @JoinColumn(name = "goal_id"))
    @Column(name = "task_id")
    private List<Long> linkedTasks = new ArrayList<>();

    private String priority; // high, medium, low

    private String color;

    private Boolean reminder = false;

    private String reminderTime; // HH:mm format

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}