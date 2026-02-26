// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\model\AIContextMessage.java
package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_context_messages")
@Data
@NoArgsConstructor
public class AIContextMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String role; // USER, ASSISTANT

    @Column(length = 5000)
    private String content;

    @Column(length = 5000)
    private String metadata;

    @ManyToOne
    @JoinColumn(name = "context_id")
    private AIContext context;

    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}