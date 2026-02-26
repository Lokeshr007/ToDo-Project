package com.loki.todo.controller;

import com.loki.todo.dto.MemberDTO;
import com.loki.todo.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/workspaces/{workspaceId}/members")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class MemberController {

    private final MemberService memberService;

    @GetMapping
    public ResponseEntity<?> getWorkspaceMembers(
            @PathVariable Long workspaceId,
            Authentication auth) {
        try {
            String email = auth.getName();
            List<MemberDTO> members = memberService.getWorkspaceMembers(workspaceId, email);
            return ResponseEntity.ok(members);
        } catch (RuntimeException e) {
            log.error("Failed to get workspace members", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to get workspace members", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> addWorkspaceMember(
            @PathVariable Long workspaceId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        try {
            String email = auth.getName();
            String userEmail = body.get("email");
            String role = body.get("role");

            if (userEmail == null || userEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "User email is required"));
            }

            MemberDTO member = memberService.addWorkspaceMember(workspaceId, userEmail, role, email);
            return ResponseEntity.status(HttpStatus.CREATED).body(member);
        } catch (RuntimeException e) {
            log.error("Failed to add workspace member", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to add workspace member", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> removeWorkspaceMember(
            @PathVariable Long workspaceId,
            @PathVariable Long userId,
            Authentication auth) {
        try {
            String email = auth.getName();
            memberService.removeWorkspaceMember(workspaceId, userId, email);
            return ResponseEntity.ok(Map.of(
                    "message", "Member removed successfully",
                    "success", true
            ));
        } catch (RuntimeException e) {
            log.error("Failed to remove workspace member", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to remove workspace member", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateMemberRole(
            @PathVariable Long workspaceId,
            @PathVariable Long userId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        try {
            String email = auth.getName();
            String role = body.get("role");

            if (role == null || role.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Role is required"));
            }

            MemberDTO member = memberService.updateMemberRole(workspaceId, userId, role, email);
            return ResponseEntity.ok(member);
        } catch (RuntimeException e) {
            log.error("Failed to update member role", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update member role", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}