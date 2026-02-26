package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SmartTask{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    private Priority priority;

    public enum Priority{
        LOW,
        MEDIUM,
        HIGH
    }

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status{
        TODO,
        IN_PROGRESS,
        DONE
    }

    private LocalDate deadline;

    // Estimated effort in hours
    private Integer estimatedHours;

    // Actual effort tracking
    private Integer actualHours;

    // AI Score (future AI priority score)
    private Double aiScore;

    // Progress percentage
    private Integer progress;

    @ManyToOne
    private Board board;

    private LocalDateTime createdAt = LocalDateTime.now();
}
