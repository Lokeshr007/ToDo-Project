// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\model\AIContext.java
package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_contexts")
@Data
@NoArgsConstructor
public class AIContext {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId;

    @Column(columnDefinition = "TEXT")
    private String contextData;

    @Column(columnDefinition = "TEXT")
    private String userPreferences;

    @Column(length = 5000)
    private String learningStyle; // VISUAL, AUDITORY, READING, KINESTHETIC

    private Integer attentionSpan; // in minutes

    @ElementCollection
    @CollectionTable(name = "ai_context_strengths", joinColumns = @JoinColumn(name = "context_id"))
    @Column(name = "strength")
    private List<String> strengths = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "ai_context_weaknesses", joinColumns = @JoinColumn(name = "context_id"))
    @Column(name = "weakness")
    private List<String> weaknesses = new ArrayList<>();

    private Double progressRate; // 0-100

    private LocalDateTime lastInteraction;
    private Integer interactionCount;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "plan_id")  // Add this for the relationship
    private EnhancedAIPlan currentPlan;

    @OneToMany(mappedBy = "context", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AIContextMessage> messageHistory = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        interactionCount = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}