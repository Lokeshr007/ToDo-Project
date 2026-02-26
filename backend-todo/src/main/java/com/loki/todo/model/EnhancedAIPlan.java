// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\model\EnhancedAIPlan.java
package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "enhanced_ai_plans")
@Data
@NoArgsConstructor
public class EnhancedAIPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private Integer durationDays;
    private String sourceFileName;
    private String sourceFileType;

    @Column(length = 20000)
    private String rawContent;

    @Column(length = 20000)
    private String parsedPlanJson;

    @Column(length = 5000)
    private String summary;

    private String difficulty; // BEGINNER, INTERMEDIATE, ADVANCED
    private String category; // DEVELOPMENT, LANGUAGE, BUSINESS, FITNESS, ACADEMIC

    private Double estimatedTotalHours;
    private Double recommendedDailyHours;
    private Integer confidenceScore; // 0-100

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EnhancedAITask> generatedTasks = new ArrayList<>();

    // Fix: Remove the mappedBy reference to 'plan' in AIContext since AIContext doesn't have a 'plan' field
    // Instead, make it a unidirectional relationship or add the field to AIContext
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "plan_id")
    private List<AIContext> contexts = new ArrayList<>();

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "project_structure_id")
    private AIProjectStructure projectStructure;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime processedAt;

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