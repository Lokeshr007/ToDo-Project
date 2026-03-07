package com.loki.todo.dto;

import com.loki.todo.model.TimeTracking;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class TimeTrackingResponse {
    private Long id;
    private java.util.Map<String, Object> todo;
    private Long userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Double hoursLogged;
    private String description;
    private LocalDateTime createdAt;
    private Long duration;
    private boolean active;

    public static TimeTrackingResponse fromEntity(TimeTracking entity) {
        if (entity == null) {
            return null;
        }
        TimeTrackingResponse response = new TimeTrackingResponse();
        response.setId(entity.getId());
        if (entity.getTodo() != null) {
            java.util.Map<String, Object> todoMap = new java.util.HashMap<>();
            todoMap.put("id", entity.getTodo().getId());
            response.setTodo(todoMap);
        }
        if (entity.getUser() != null) {
            response.setUserId(entity.getUser().getId());
        }
        response.setStartTime(entity.getStartTime());
        response.setEndTime(entity.getEndTime());
        response.setHoursLogged(entity.getHoursLogged());
        response.setDescription(entity.getDescription());
        response.setCreatedAt(entity.getCreatedAt());

        if (entity.getStartTime() != null && entity.getEndTime() != null) {
            response.setDuration(java.time.Duration.between(entity.getStartTime(), entity.getEndTime()).getSeconds());
        } else if (entity.getStartTime() != null) {
            response.setDuration(java.time.Duration.between(entity.getStartTime(), LocalDateTime.now()).getSeconds());
        }

        response.setActive(entity.isActive());
        return response;
    }
}
