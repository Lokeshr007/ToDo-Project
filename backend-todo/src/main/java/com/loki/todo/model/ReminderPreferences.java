package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "reminder_preferences")
@Data
@NoArgsConstructor
public class ReminderPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Boolean emailEnabled = true;

    private Boolean pushEnabled = true;

    private Boolean smsEnabled = false;

    private Integer defaultLeadTime = 15; // minutes

    private String quietHoursStart = "22:00";

    private String quietHoursEnd = "07:00";

    private Boolean weekdayOnly = false;

    private Boolean intelligentReminders = true;

    private String reminderFrequency = "once"; // once, twice, escalating

    private Integer maxReminders = 3;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true)
    private User user;
}