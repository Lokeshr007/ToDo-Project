package com.loki.todo.service;

import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class RealtimeNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendWorkspaceUpdate(Long workspaceId, String type, Object data) {
        messagingTemplate.convertAndSend("/topic/workspace/" + workspaceId, (Object) Map.of(
                "type", type,
                "data", data,
                "timestamp", System.currentTimeMillis()
        ));
    }

    public void sendProjectUpdate(Long projectId, String type, Object data) {
        messagingTemplate.convertAndSend("/topic/project/" + projectId, (Object) Map.of(
                "type", type,
                "data", data,
                "timestamp", System.currentTimeMillis()
        ));
    }

    public void sendUserNotification(Long userId, String type, String message) {
        messagingTemplate.convertAndSend("/topic/user/" + userId, (Object) Map.of(
                "type", type,
                "message", message,
                "timestamp", System.currentTimeMillis()
        ));
    }
}
