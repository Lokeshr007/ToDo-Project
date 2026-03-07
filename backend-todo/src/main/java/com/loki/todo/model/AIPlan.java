// BACKEND-TODO/SRC/main/java/com/loki/todo/model/AIPlan.java
package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ai_plans")
@Data
@NoArgsConstructor
public class AIPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    private Integer durationDays;

    private String sourceFileName;

    @Column(name = "plan_raw_text", columnDefinition = "TEXT")
    private String planRawText;

    @Column(name = "parsed_plan_data", columnDefinition = "TEXT")
    private String parsedPlanData;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "plan", cascade = CascadeType.ALL)
    private List<AIGeneratedTask> generatedTasks = new ArrayList<>();

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