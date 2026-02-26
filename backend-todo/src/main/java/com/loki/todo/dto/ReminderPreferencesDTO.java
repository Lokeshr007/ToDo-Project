package com.loki.todo.dto;

import lombok.Data;

@Data
public class ReminderPreferencesDTO {
    private Long id;
    private Boolean emailEnabled;
    private Boolean pushEnabled;
    private Boolean smsEnabled;
    private Integer defaultLeadTime;
    private String quietHoursStart;
    private String quietHoursEnd;
    private Boolean weekdayOnly;
    private Boolean intelligentReminders;
    private String reminderFrequency;
    private Integer maxReminders;
    private Long userId;
}