package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reminders")
@Data
@NoArgsConstructor
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(nullable = false)
    private LocalDateTime scheduledFor;

    private LocalDateTime triggeredAt;

    private Boolean triggered = false;

    private Boolean completed = false;

    private LocalDateTime completedAt;

    private Boolean snoozed = false;

    private Integer snoozeCount = 0;

    private Long todoId; // linked task

    private String reminderType; // before, after, specific

    private Integer leadTime; // minutes before/after

    @ElementCollection
    @CollectionTable(name = "reminder_channels",
            joinColumns = @JoinColumn(name = "reminder_id"))
    @Column(name = "channel")
    private List<String> channels = new ArrayList<>(); // push, email, sms

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}