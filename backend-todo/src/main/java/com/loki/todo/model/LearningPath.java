package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "learning_paths")
@Data
@NoArgsConstructor
public class LearningPath {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private String category;
    private String difficulty;

    private Integer totalDays;
    private Double totalHours;

    @Column(length = 5000)
    private String learningObjectives;

    @Column(length = 5000)
    private String prerequisites;

    @Column(length = 5000)
    private String resources;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private List<LearningPathMilestone> milestones = new ArrayList<>();

    private Boolean isPublic = false;
    private Integer usageCount = 0;
    private Double averageRating = 0.0;

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