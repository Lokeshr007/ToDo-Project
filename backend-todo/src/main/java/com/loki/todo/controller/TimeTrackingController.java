// com/loki/todo/controller/TimeTrackingController.java
package com.loki.todo.controller;

import com.loki.todo.dto.TimeTrackingResponse;
import com.loki.todo.model.TimeTracking;
import com.loki.todo.service.TimeTrackingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/todos/time")
@RequiredArgsConstructor
public class TimeTrackingController {

    private final TimeTrackingService timeTrackingService;

    @GetMapping("/active")
    public ResponseEntity<?> getActiveTimer(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            TimeTracking activeTimer = timeTrackingService.getActiveTimer(userEmail);
            if (activeTimer != null) {
                return ResponseEntity.ok(TimeTrackingResponse.fromEntity(activeTimer));
            }
            return ResponseEntity.ok(null);
        } catch (RuntimeException e) {
            return ResponseEntity.ok(null);
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{trackingId}/stop")
    public ResponseEntity<?> stopTimer(@PathVariable Long trackingId, Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            TimeTracking tracking = timeTrackingService.stopTimeTracking(trackingId, userEmail);
            return ResponseEntity.ok(TimeTrackingResponse.fromEntity(tracking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}