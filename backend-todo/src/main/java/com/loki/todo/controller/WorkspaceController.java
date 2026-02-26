// com/loki/todo/controller/WorkspaceController.java
package com.loki.todo.controller;

import com.loki.todo.dto.WorkspaceDTO;
import com.loki.todo.dto.WorkspaceSummaryDTO;
import com.loki.todo.service.WorkspaceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/workspaces")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @GetMapping
    public ResponseEntity<?> getUserWorkspaces(Authentication auth) {
        try {
            if (auth == null || !auth.isAuthenticated()) {
                log.warn("Unauthenticated request to /workspaces");
                return ResponseEntity.ok(Collections.emptyList());
            }

            String email = auth.getName();
            log.debug("Fetching workspaces for user: {}", email);

            List<WorkspaceSummaryDTO> workspaces = workspaceService.getUserWorkspaceDTOs(email);
            return ResponseEntity.ok(workspaces);

        } catch (Exception e) {
            log.error("Error fetching workspaces", e);
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    @GetMapping("/{workspaceId}")
    public ResponseEntity<?> getWorkspace(
            @PathVariable Long workspaceId,
            Authentication auth) {
        try {
            String email = auth.getName();
            WorkspaceDTO workspace = workspaceService.getWorkspace(workspaceId, email);
            return ResponseEntity.ok(workspace);
        } catch (RuntimeException e) {
            log.error("Failed to get workspace", e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to get workspace", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createWorkspace(
            @RequestBody Map<String, String> body,
            Authentication auth) {
        try {
            String email = auth.getName();
            String name = body.get("name");
            String description = body.get("description");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Workspace name is required"));
            }

            WorkspaceDTO workspace = workspaceService.createWorkspace(name, description, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(workspace);
        } catch (RuntimeException e) {
            log.error("Failed to create workspace", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to create workspace", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{workspaceId}")
    public ResponseEntity<?> updateWorkspace(
            @PathVariable Long workspaceId,
            @RequestBody Map<String, String> updates,
            Authentication auth) {
        try {
            String email = auth.getName();
            WorkspaceDTO workspace = workspaceService.updateWorkspace(workspaceId, updates, email);
            return ResponseEntity.ok(workspace);
        } catch (RuntimeException e) {
            log.error("Failed to update workspace", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update workspace", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{workspaceId}")
    public ResponseEntity<?> deleteWorkspace(
            @PathVariable Long workspaceId,
            Authentication auth) {
        try {
            String email = auth.getName();
            workspaceService.deleteWorkspace(workspaceId, email);
            return ResponseEntity.ok(Map.of(
                    "message", "Workspace deleted successfully",
                    "success", true
            ));
        } catch (RuntimeException e) {
            log.error("Failed to delete workspace", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to delete workspace", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}