package com.loki.todo.timeline;

import com.loki.todo.model.*;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TimelineEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventType;

    @Lob
    private String description;

    private LocalDateTime createdAt;

    @ManyToOne
    private Workspace workspace;

    @ManyToOne
    private User actor;

    private Long entityId; // Todo ID or other

    // getters setters
}