package com.loki.todo.controller;

import com.loki.todo.dto.PreferencesDTO;
import com.loki.todo.dto.UserDTO;
import com.loki.todo.model.User;
import com.loki.todo.service.PreferencesService;
import com.loki.todo.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/users/preferences")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class PreferencesController {

    private final PreferencesService preferencesService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<PreferencesDTO> getPreferences(Authentication auth) {
        String email = auth.getName();
        log.info("Getting preferences for user: {}", email);

      PreferencesDTO preferences = preferencesService.getPreferences(email);
        return ResponseEntity.ok(preferences);
    }

    @PutMapping
    public ResponseEntity<UserDTO> updatePreferences(
            @RequestBody Map<String, Object> preferences,
            Authentication auth) {
        String email = auth.getName();
        log.info("Updating all preferences for user: {}", email);

        User updatedUser = preferencesService.updatePreferences(email, preferences);
        return ResponseEntity.ok(userService.mapToDTO(updatedUser));
    }

    @PutMapping("/{key}")
    public ResponseEntity<UserDTO> updatePreference(
            @PathVariable String key,
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        String email = auth.getName();
        Object value = body.get("value");
        log.info("Updating preference '{}' for user: {}", key, email);

        User updatedUser = preferencesService.updatePreference(email, key, value);
        return ResponseEntity.ok(userService.mapToDTO(updatedUser));
    }

    @PostMapping("/reset")
    public ResponseEntity<UserDTO> resetPreferences(Authentication auth) {
        String email = auth.getName();
        log.info("Resetting preferences for user: {}", email);

        preferencesService.resetPreferences(email);
        User user = userService.getUserByEmail(email);
        return ResponseEntity.ok(userService.mapToDTO(user));
    }

    // Add to PreferencesController.java

    @PutMapping("/theme")
    public ResponseEntity<UserDTO> updateTheme(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        String email = auth.getName();
        Object value = body.get("value");
        log.info("Updating theme for user: {}", email);

        User updatedUser = preferencesService.updatePreference(email, "theme", value);
        return ResponseEntity.ok(userService.mapToDTO(updatedUser));
    }

    @PutMapping("/language")
    public ResponseEntity<UserDTO> updateLanguage(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        String email = auth.getName();
        Object value = body.get("value");
        log.info("Updating language for user: {}", email);

        User updatedUser = preferencesService.updatePreference(email, "language", value);
        return ResponseEntity.ok(userService.mapToDTO(updatedUser));
    }

    @PutMapping("/timezone")
    public ResponseEntity<UserDTO> updateTimezone(
            @RequestBody Map<String, Object> body,
            Authentication auth) {
        String email = auth.getName();
        Object value = body.get("value");
        log.info("Updating timezone for user: {}", email);

        User updatedUser = preferencesService.updatePreference(email, "timezone", value);
        return ResponseEntity.ok(userService.mapToDTO(updatedUser));
    }
}