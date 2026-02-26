package com.loki.todo.controller;

import com.loki.todo.dto.*;
import com.loki.todo.model.User;
import com.loki.todo.service.AuthService;
import com.loki.todo.service.UserService;
import com.loki.todo.service.UserStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserStatsService userStatsService;
    private final AuthService authService;

    @GetMapping("/profile")
    public ResponseEntity<UserDTO> getProfile(Authentication auth) {
        String email = auth.getName();
        UserDTO profile = userService.getUserProfile(email);
        return ResponseEntity.ok(profile);
    }

    // FIXED: Changed from @PathVariable Long userId to @PathVariable("userId") Long userId
    @GetMapping("/{userId}/stats")
    public ResponseEntity<UserStatsDTO> getUserStatsById(@PathVariable("userId") Long userId) {
        System.out.println("Getting stats for user ID: " + userId); // Add logging
        UserStatsDTO stats = userStatsService.getUserStats(userId);
        return ResponseEntity.ok(stats);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDTO> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication auth) {
        String email = auth.getName();
        UserDTO updated = userService.updateProfile(email, request);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/avatar")
    public ResponseEntity<UserDTO> uploadAvatar(
            @RequestParam("avatar") MultipartFile file,
            Authentication auth) {
        String email = auth.getName();
        UserDTO updated = userService.uploadAvatar(email, file);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/cover")
    public ResponseEntity<UserDTO> uploadCover(
            @RequestParam("cover") MultipartFile file,
            Authentication auth) {
        String email = auth.getName();
        UserDTO updated = userService.uploadCover(email, file);
        return ResponseEntity.ok(updated);
    }

    // FIXED: This should work now
    @GetMapping("/stats")
    public ResponseEntity<UserStatsDTO> getUserStatsByEmail(Authentication auth) {
        String email = auth.getName();
        System.out.println("Getting stats for email: " + email); // Add logging
        User user = userService.getUserByEmail(email);
        UserStatsDTO stats = userStatsService.getUserStats(user.getId());
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionDTO>> getActiveSessions(Authentication auth) {
        String email = auth.getName();
        List<SessionDTO> sessions = userService.getActiveSessions(email);
        return ResponseEntity.ok(sessions);
    }

    @DeleteMapping("/sessions/{sessionId}")
    public ResponseEntity<?> revokeSession(
            @PathVariable Long sessionId,
            Authentication auth) {
        String email = auth.getName();
        userService.revokeSession(sessionId, email);
        return ResponseEntity.ok(Map.of("message", "Session revoked successfully"));
    }

    @DeleteMapping("/sessions")
    public ResponseEntity<?> revokeAllSessions(Authentication auth) {
        String email = auth.getName();
        userService.revokeAllOtherSessions(email);
        return ResponseEntity.ok(Map.of("message", "All other sessions revoked"));
    }

    @GetMapping("/activity")
    public ResponseEntity<List<ActivityDTO>> getUserActivity(
            @RequestParam(defaultValue = "20") int limit,
            Authentication auth) {
        String email = auth.getName();
        List<ActivityDTO> activities = userService.getUserActivity(email, limit);
        return ResponseEntity.ok(activities);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication auth) {
        String email = auth.getName();
        userService.changePassword(email, request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/enable-2fa")
    public ResponseEntity<Map<String, String>> enable2FA(Authentication auth) {
        String email = auth.getName();
        Map<String, String> result = userService.enable2FA(email);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/verify-2fa")
    public ResponseEntity<?> verify2FA(
            @RequestParam String code,
            Authentication auth) {
        String email = auth.getName();
        userService.verify2FA(email, code);
        return ResponseEntity.ok(Map.of("message", "2FA enabled successfully"));
    }

    @PostMapping("/disable-2fa")
    public ResponseEntity<?> disable2FA(Authentication auth) {
        String email = auth.getName();
        userService.disable2FA(email);
        return ResponseEntity.ok(Map.of("message", "2FA disabled successfully"));
    }

    @GetMapping("/export")
    public ResponseEntity<Map<String, Object>> exportUserData(Authentication auth) {
        String email = auth.getName();
        Map<String, Object> data = userService.exportUserData(email);
        return ResponseEntity.ok(data);
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(Authentication auth) {
        String email = auth.getName();
        userService.deleteAccount(email);
        return ResponseEntity.ok(Map.of("message", "Account deleted successfully"));
    }
}