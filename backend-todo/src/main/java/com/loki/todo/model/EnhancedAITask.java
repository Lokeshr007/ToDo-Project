package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "enhanced_ai_tasks")
@Data
@NoArgsConstructor
public class EnhancedAITask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 5000)
    private String description;

    private Integer dayNumber;
    private Integer weekNumber;
    private String priority; // HIGH, MEDIUM, LOW

    private Double estimatedHours;
    private Double actualHours;

    private String status; // PENDING, IN_PROGRESS, COMPLETED, BLOCKED

    private String category;
    private String subCategory;

    @ElementCollection
    @CollectionTable(name = "ai_task_tags", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "tag")
    private List<String> tags = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "ai_task_prerequisites", joinColumns = @JoinColumn(name = "task_id"))
    @Column(name = "prerequisite")
    private List<String> prerequisites = new ArrayList<>();

    private String resourceLinks; // JSON array of resources

    private String deliverables; // What to produce

    @ManyToOne
    @JoinColumn(name = "plan_id")
    private EnhancedAIPlan plan;

    private Long parentTaskId; // For subtasks

    private Integer orderIndex;

    @OneToOne
    @JoinColumn(name = "created_todo_id")
    private Todos createdTodo;

    private Boolean accepted = false;
    private Boolean rejected = false;
    private String rejectionReason;

    private LocalDate suggestedStartDate;
    private LocalDate suggestedDueDate;

    private LocalDateTime createdAt;
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
}