package com.loki.todo.controller;

import com.loki.todo.dto.NotificationDTO;
import com.loki.todo.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getNotifications(
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String filter,
            Authentication auth) {

        List<NotificationDTO> notifications = notificationService.getUserNotifications(auth.getName(), limit, filter);
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread/count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication auth) {
        long count = notificationService.getUnreadCount(auth.getName());
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id, Authentication auth) {
        NotificationDTO notification = notificationService.markAsRead(id, auth.getName());
        return ResponseEntity.ok(notification);
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth.getName());
        Map<String, String> response = new HashMap<>();
        response.put("message", "All marked as read");
        return ResponseEntity.ok(response);
    }
}