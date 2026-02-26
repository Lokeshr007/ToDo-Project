package com.loki.todo.service;

import com.loki.todo.dto.PreferencesDTO;
import com.loki.todo.model.User;
import com.loki.todo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PreferencesService {

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public User updatePreferences(String email, Map<String, Object> preferences) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Get existing preferences or create new
            Map<String, Object> currentPrefs = getPreferencesMap(user);

            // Update with new preferences
            if (preferences != null) {
                currentPrefs.putAll(preferences);
            }

            // Convert to JSON and save
            String preferencesJson = objectMapper.writeValueAsString(currentPrefs);
            user.setPreferences(preferencesJson);

            User updatedUser = userRepository.save(user);
            log.info("Preferences updated for user: {}", email);

            return updatedUser;

        } catch (Exception e) {
            log.error("Failed to update preferences for user: {}", email, e);
            throw new RuntimeException("Failed to update preferences: " + e.getMessage());
        }
    }

    @Transactional
    public User updatePreference(String email, String key, Object value) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Get existing preferences
            Map<String, Object> currentPrefs = getPreferencesMap(user);

            // Update single preference
            currentPrefs.put(key, value);

            // Convert to JSON and save
            String preferencesJson = objectMapper.writeValueAsString(currentPrefs);
            user.setPreferences(preferencesJson);

            User updatedUser = userRepository.save(user);
            log.info("Preference '{}' updated for user: {}", key, email);

            return updatedUser;

        } catch (Exception e) {
            log.error("Failed to update preference '{}' for user: {}", key, email, e);
            throw new RuntimeException("Failed to update preference: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public PreferencesDTO getPreferences(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> prefsMap = getPreferencesMap(user);
        return PreferencesDTO.fromMap(prefsMap);
    }

    @Transactional
    public void resetPreferences(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            // Reset to default preferences
            PreferencesDTO defaultPrefs = new PreferencesDTO();
            String defaultPrefsJson = objectMapper.writeValueAsString(defaultPrefs.toMap());
            user.setPreferences(defaultPrefsJson);

            userRepository.save(user);
            log.info("Preferences reset to default for user: {}", email);

        } catch (Exception e) {
            log.error("Failed to reset preferences for user: {}", email, e);
            throw new RuntimeException("Failed to reset preferences: " + e.getMessage());
        }
    }

    private Map<String, Object> getPreferencesMap(User user) {
        if (user.getPreferences() == null || user.getPreferences().isEmpty()) {
            return new HashMap<>();
        }

        try {
            return objectMapper.readValue(user.getPreferences(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse preferences JSON for user: {}", user.getEmail(), e);
            return new HashMap<>();
        }
    }
}