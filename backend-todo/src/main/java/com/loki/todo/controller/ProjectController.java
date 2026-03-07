package com.loki.todo.controller;

import com.loki.todo.dto.ProjectDTO;
import com.loki.todo.model.Project;
import com.loki.todo.service.ProjectService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/projects")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @GetMapping
    public ResponseEntity<?> getProjects(
            @RequestParam Long workspaceId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            log.info("Fetching projects for workspace: {} by user: {}", workspaceId, email);

            List<Project> projects = projectService.getProjects(workspaceId, email);
            List<ProjectDTO> projectDTOs = projectService.convertToDTOs(projects);

            return ResponseEntity.ok(projectDTOs);
        } catch (Exception e) {
            log.error("Failed to fetch projects", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<?> getProject(
            @PathVariable Long projectId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            log.info("Fetching project: {} for user: {}", projectId, email);

            Project project = projectService.getProject(projectId, email);
            ProjectDTO projectDTO = projectService.convertToDTO(project);

            return ResponseEntity.ok(projectDTO);
        } catch (RuntimeException e) {
            log.error("Project not found: {}", projectId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to fetch project", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createProject(
            @RequestBody Map<String, Object> body,
            @RequestParam Long workspaceId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            String name = (String) body.get("name");
            String description = (String) body.get("description");
            String color = (String) body.get("color");
            List<String> memberEmails = (List<String>) body.get("memberEmails");

            log.info("Creating project: {} in workspace: {} by user: {}", name, workspaceId, email);

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Project name is required"));
            }

            Project project = projectService.createProject(
                    workspaceId,
                    name,
                    description,
                    color,
                    email,
                    memberEmails
            );

            ProjectDTO projectDTO = projectService.convertToDTO(project);

            return ResponseEntity.status(HttpStatus.CREATED).body(projectDTO);
        } catch (RuntimeException e) {
            log.error("Failed to create project", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to create project", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<?> updateProject(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            String name = body.get("name");
            String description = body.get("description");
            String color = body.get("color");

            log.info("Updating project: {} by user: {}", projectId, email);

            Project project = projectService.updateProject(
                    projectId,
                    name,
                    description,
                    color,
                    email
            );

            ProjectDTO projectDTO = projectService.convertToDTO(project);

            return ResponseEntity.ok(projectDTO);
        } catch (RuntimeException e) {
            log.error("Failed to update project", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update project", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(
            @PathVariable Long projectId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            log.info("Deleting project: {} by user: {}", projectId, email);

            projectService.deleteProject(projectId, email);

            return ResponseEntity.ok(Map.of(
                    "message", "Project deleted successfully",
                    "success", true
            ));
        } catch (RuntimeException e) {
            log.error("Failed to delete project", e);
            String errorMsg = e.toString() + (e.getCause() != null ? " | Cause: " + e.getCause().toString() : "");
            return ResponseEntity.badRequest()
                    .body(Map.of("error", errorMsg));
        } catch (Exception e) {
            log.error("Failed to delete project", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{projectId}/duplicate")
    public ResponseEntity<?> duplicateProject(
            @PathVariable Long projectId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            log.info("Duplicating project: {} by user: {}", projectId, email);

            Project project = projectService.duplicateProject(projectId, email);
            ProjectDTO projectDTO = projectService.convertToDTO(project);

            return ResponseEntity.status(HttpStatus.CREATED).body(projectDTO);
        } catch (RuntimeException e) {
            log.error("Failed to duplicate project", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to duplicate project", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{projectId}/stats")
    public ResponseEntity<?> getProjectStats(
            @PathVariable Long projectId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            log.info("Fetching stats for project: {} by user: {}", projectId, email);

            Map<String, Object> stats = projectService.getProjectStats(projectId, email);

            return ResponseEntity.ok(stats);
        } catch (RuntimeException e) {
            log.error("Failed to fetch project stats", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to fetch project stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{projectId}/members/{userId}")
    public ResponseEntity<?> addMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            log.info("Adding member: {} to project: {} by user: {}", userId, projectId, email);

            Project project = projectService.addMemberToProject(projectId, userId, email);
            ProjectDTO projectDTO = projectService.convertToDTO(project);

            return ResponseEntity.ok(projectDTO);
        } catch (RuntimeException e) {
            log.error("Failed to add member to project", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to add member to project", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{projectId}/members/email")
    public ResponseEntity<?> addMemberByEmail(
            @PathVariable Long projectId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            String memberEmail = body.get("email");
            log.info("Adding member by email: {} to project: {} by user: {}", memberEmail, projectId, email);

            Project project = projectService.addMemberToProjectByEmail(projectId, memberEmail, email);
            ProjectDTO projectDTO = projectService.convertToDTO(project);

            return ResponseEntity.ok(projectDTO);
        } catch (RuntimeException e) {
            log.error("Failed to add member by email to project", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to add member by email to project", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public ResponseEntity<?> removeMember(
            @PathVariable Long projectId,
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            log.info("Removing member: {} from project: {} by user: {}", userId, projectId, email);

            Project project = projectService.removeMemberFromProject(projectId, userId, email);
            ProjectDTO projectDTO = projectService.convertToDTO(project);

            return ResponseEntity.ok(projectDTO);
        } catch (RuntimeException e) {
            log.error("Failed to remove member from project", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to remove member from project", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}