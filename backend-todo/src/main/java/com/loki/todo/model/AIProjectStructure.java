// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\model\AIProjectStructure.java
package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_project_structures")
@Data
@NoArgsConstructor
public class AIProjectStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectName;
    private String projectDescription;
    private String projectColor;

    @OneToOne
    @JoinColumn(name = "plan_id")
    private EnhancedAIPlan plan;

    private Long createdProjectId; // Reference to actual Project

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "project_structure_id")
    private List<AIBoardStructure> boards = new ArrayList<>();

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}