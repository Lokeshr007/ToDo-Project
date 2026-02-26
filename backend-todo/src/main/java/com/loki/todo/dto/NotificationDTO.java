package com.loki.todo.dto;

import com.loki.todo.model.Notification;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationDTO {
    private Long id;
    private String type;
    private String title;
    private String message;
    private boolean read;
    private String actionUrl;
    private String icon;
    private String color;
    private LocalDateTime createdAt;
    private String timeAgo;
    private Long userId;
    private Long workspaceId;
    private Long todoId;
    private Long projectId;
    private String metadata;

    public static NotificationDTO fromEntity(Notification notification) {
        if (notification == null) return null;

        NotificationDTO dto = new NotificationDTO();
        dto.setId(notification.getId());
        dto.setType(notification.getType());
        dto.setTitle(notification.getTitle());
        dto.setMessage(notification.getMessage());
        dto.setRead(notification.isRead());
        dto.setActionUrl(notification.getActionUrl());
        dto.setIcon(notification.getIcon());
        dto.setColor(notification.getColor());
        dto.setCreatedAt(notification.getCreatedAt());
        dto.setTimeAgo(formatTimeAgo(notification.getCreatedAt()));

        if (notification.getUser() != null) {
            dto.setUserId(notification.getUser().getId());
        }

        if (notification.getWorkspace() != null) {
            dto.setWorkspaceId(notification.getWorkspace().getId());
        }

        if (notification.getTodo() != null) {
            dto.setTodoId(notification.getTodo().getId());
        }

        if (notification.getProject() != null) {
            dto.setProjectId(notification.getProject().getId());
        }

        dto.setMetadata(notification.getMetadata());

        return dto;
    }

    private static String formatTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "";

        LocalDateTime now = LocalDateTime.now();
        java.time.Duration duration = java.time.Duration.between(dateTime, now);

        if (duration.toMinutes() < 1) {
            return "Just now";
        } else if (duration.toHours() < 1) {
            return duration.toMinutes() + " min ago";
        } else if (duration.toDays() < 1) {
            return duration.toHours() + " hours ago";
        } else if (duration.toDays() < 7) {
            return duration.toDays() + " days ago";
        } else {
            return dateTime.format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
        }
    }
}