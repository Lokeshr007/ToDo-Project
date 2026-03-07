package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "time_tracking")
public class TimeTracking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Todos todo;

    @ManyToOne
    private User user;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "hours_logged")
    private Double hoursLogged;

    private String description;

    @Column(name = "created_at")
    private LocalDateTime createdAt;



    public void stop() {
        this.endTime = LocalDateTime.now();
        if (startTime != null) {
            // Convert duration to fractional hours: toMinutes() / 60.0
            this.hoursLogged = java.time.Duration.between(startTime, endTime).toMinutes() / 60.0;
        }
    }


    private Long duration; // in seconds or minutes



    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (startTime == null) {
            startTime = LocalDateTime.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        if (endTime != null && startTime != null) {
            // Calculate duration in seconds
            duration = java.time.Duration.between(startTime, endTime).getSeconds();
        }
    }

    public boolean isActive() {
        return startTime != null && endTime == null;
    }
}