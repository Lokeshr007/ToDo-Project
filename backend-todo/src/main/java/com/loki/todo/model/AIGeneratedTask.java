// BACKEND-TODO/SRC/main/java/com/loki/todo/model/AIGeneratedTask.java
package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_generated_tasks")
@Data
@NoArgsConstructor
public class AIGeneratedTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    private String priority;

    private Integer dayNumber;

    private LocalDate suggestedDueDate;

    private Double estimatedHours;

    private String subject;

    private Boolean accepted;

    @Column(length = 1000)
    private String tags; // JSON array

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "plan_id")
    private AIPlan plan;

    @OneToOne
    @JoinColumn(name = "created_todo_id")
    private Todos createdTodo;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}