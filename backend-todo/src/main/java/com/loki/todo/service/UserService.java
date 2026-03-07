package com.loki.todo.service;

import com.loki.todo.dto.*;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import com.loki.todo.security.SessionContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final DeviceSessionRepository deviceSessionRepo;
    private final RefreshTokenRepository refreshTokenRepo;
    private final ActivityRepository activityRepo;
    private final TodosRepository todosRepo;
    private final ProjectRepository projectRepo;
    private final TimeBlockRepository timeBlockRepo;
    private final PreferencesService preferencesService;
    private final BCryptPasswordEncoder passwordEncoder;

    private static final String AVATAR_UPLOAD_DIR = "uploads/avatars/";
    private static final String COVER_UPLOAD_DIR = "uploads/covers/";

    public User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserDTO getUserProfile(String email) {
        User user = getUserByEmail(email);
        return mapToDTO(user);
    }

    @Transactional
    public UserDTO updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);

        StringBuilder changes = new StringBuilder();

        if (request.getName() != null && !request.getName().equals(user.getName())) {
            user.setName(request.getName());
            changes.append("name, ");
        }

        if (request.getBio() != null) {
            user.setBio(request.getBio());
            changes.append("bio, ");
        }

        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
            changes.append("phone, ");
        }

        if (request.getLocation() != null) {
            user.setLocation(request.getLocation());
            changes.append("location, ");
        }

        if (request.getCompany() != null) {
            user.setCompany(request.getCompany());
            changes.append("company, ");
        }

        if (request.getJobTitle() != null) {
            user.setJobTitle(request.getJobTitle());
            changes.append("job title, ");
        }

        if (request.getThemePreference() != null) {
            user.setThemePreference(request.getThemePreference());
            changes.append("theme, ");
        }

        if (request.getEmailNotifications() != null) {
            user.setEmailNotifications(request.getEmailNotifications());
            changes.append("email notifications, ");
        }

        if (request.getPushNotifications() != null) {
            user.setPushNotifications(request.getPushNotifications());
            changes.append("push notifications, ");
        }

        if (request.getTimezone() != null) {
            user.setTimezone(request.getTimezone());
            changes.append("timezone, ");
        }

        if (request.getLanguage() != null) {
            user.setLanguage(request.getLanguage());
            changes.append("language, ");
        }

        if (request.getSocialLinks() != null) {
            String socialLinksJson = convertMapToJson(request.getSocialLinks());
            user.setSocialLinks(socialLinksJson);
            changes.append("social links, ");
        }

        // Handle preferences - use PreferencesService for better management
        if (request.getPreferences() != null) {
            try {
                // Get current preferences
                Map<String, Object> currentPrefs = getPreferencesMap(user);

                // Merge with new preferences
                currentPrefs.putAll(request.getPreferences());

                // Save back to user
                String preferencesJson = convertMapToJson(currentPrefs);
                user.setPreferences(preferencesJson);
                changes.append("preferences, ");
            } catch (Exception e) {
                log.error("Failed to update preferences", e);
            }
        }

        User updatedUser = userRepo.save(user);

        if (changes.length() > 0) {
            Activity activity = Activity.builder()
                    .type("PROFILE_UPDATE")
                    .description("Profile updated: " + changes.substring(0, changes.length() - 2))
                    .userId(user.getId())
                    .timestamp(LocalDateTime.now())
                    .build();
            activityRepo.save(activity);
        }

        log.info("Profile updated for user: {}", email);
        return mapToDTO(updatedUser);
    }

    @Transactional
    public UserDTO uploadAvatar(String email, MultipartFile file) {
        try {
            User user = getUserByEmail(email);

            Path uploadPath = Paths.get(AVATAR_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath);

            if (user.getProfilePicture() != null) {
                Path oldFilePath = Paths.get(user.getProfilePicture());
                try {
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    log.warn("Could not delete old avatar: {}", e.getMessage());
                }
            }

            user.setProfilePicture(filePath.toString().replace("\\", "/"));
            User updatedUser = userRepo.save(user);

            Activity activity = Activity.builder()
                    .type("AVATAR_UPLOAD")
                    .description("Profile picture updated")
                    .userId(user.getId())
                    .timestamp(LocalDateTime.now())
                    .build();
            activityRepo.save(activity);

            log.info("Avatar uploaded for user: {}", email);
            return mapToDTO(updatedUser);

        } catch (IOException e) {
            log.error("Failed to upload avatar", e);
            throw new RuntimeException("Failed to upload avatar: " + e.getMessage());
        }
    }

    @Transactional
    public UserDTO uploadCover(String email, MultipartFile file) {
        try {
            User user = getUserByEmail(email);

            Path uploadPath = Paths.get(COVER_UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath);

            if (user.getCoverPhoto() != null) {
                Path oldFilePath = Paths.get(user.getCoverPhoto());
                try {
                    Files.deleteIfExists(oldFilePath);
                } catch (IOException e) {
                    log.warn("Could not delete old cover: {}", e.getMessage());
                }
            }

            user.setCoverPhoto(filePath.toString().replace("\\", "/"));
            User updatedUser = userRepo.save(user);

            Activity activity = Activity.builder()
                    .type("COVER_UPLOAD")
                    .description("Cover photo updated")
                    .userId(user.getId())
                    .timestamp(LocalDateTime.now())
                    .build();
            activityRepo.save(activity);

            log.info("Cover uploaded for user: {}", email);
            return mapToDTO(updatedUser);

        } catch (IOException e) {
            log.error("Failed to upload cover", e);
            throw new RuntimeException("Failed to upload cover: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public List<SessionDTO> getActiveSessions(String email) {
        User user = getUserByEmail(email);
        List<DeviceSession> sessions = deviceSessionRepo.findByUserAndActiveTrue(user);

        return sessions.stream()
                .map(session -> SessionDTO.fromEntity(session, isCurrentSession(session)))
                .collect(Collectors.toList());
    }

    @Transactional
    public void revokeSession(Long sessionId, String email) {
        User user = getUserByEmail(email);
        DeviceSession session = deviceSessionRepo.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to revoke this session");
        }

        session.setActive(false);
        session.setRevokedAt(LocalDateTime.now());
        deviceSessionRepo.save(session);

        refreshTokenRepo.deleteByDeviceSession(session);

        Activity activity = Activity.builder()
                .type("SESSION_REVOKE")
                .description("Session revoked: " + session.getDeviceName())
                .userId(user.getId())
                .timestamp(LocalDateTime.now())
                .build();
        activityRepo.save(activity);

        log.info("Session revoked: {} for user: {}", sessionId, email);
    }

    @Transactional
    public void revokeAllOtherSessions(String email) {
        User user = getUserByEmail(email);
        List<DeviceSession> sessions = deviceSessionRepo.findByUserAndActiveTrue(user);

        for (DeviceSession session : sessions) {
            if (!isCurrentSession(session)) {
                session.setActive(false);
                session.setRevokedAt(LocalDateTime.now());
                deviceSessionRepo.save(session);
                refreshTokenRepo.deleteByDeviceSession(session);
            }
        }

        Activity activity = Activity.builder()
                .type("ALL_SESSIONS_REVOKE")
                .description("All other sessions revoked")
                .userId(user.getId())
                .timestamp(LocalDateTime.now())
                .build();
        activityRepo.save(activity);

        log.info("All other sessions revoked for user: {}", email);
    }

    @Transactional(readOnly = true)
    public List<ActivityDTO> getUserActivity(String email, int limit) {
        User user = getUserByEmail(email);
        Pageable pageable = PageRequest.of(0, limit, Sort.by("timestamp").descending());
        List<Activity> activities = activityRepo.findByUserIdOrderByTimestampDesc(user.getId(), pageable);

        return activities.stream()
                .map(this::mapActivityToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = getUserByEmail(email);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("New passwords do not match");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setLastPasswordChange(LocalDateTime.now());
        userRepo.save(user);

        Activity activity = Activity.builder()
                .type("PASSWORD_CHANGE")
                .description("Password changed")
                .userId(user.getId())
                .timestamp(LocalDateTime.now())
                .build();
        activityRepo.save(activity);

        log.info("Password changed for user: {}", email);
    }

    @Transactional
    public Map<String, String> enable2FA(String email) {
        User user = getUserByEmail(email);

        String secret = generateSecret();
        user.setTwoFactorSecret(secret);
        userRepo.save(user);

        Activity activity = Activity.builder()
                .type("2FA_ENABLE")
                .description("Two-factor authentication setup started")
                .userId(user.getId())
                .timestamp(LocalDateTime.now())
                .build();
        activityRepo.save(activity);

        return Map.of(
                "secret", secret,
                "message", "2FA setup started"
        );
    }

    @Transactional
    public void verify2FA(String email, String code) {
        User user = getUserByEmail(email);

        if (code.length() != 6) {
            throw new RuntimeException("Invalid verification code");
        }

        user.setTwoFactorEnabled(true);
        userRepo.save(user);

        Activity activity = Activity.builder()
                .type("2FA_VERIFY")
                .description("Two-factor authentication enabled")
                .userId(user.getId())
                .timestamp(LocalDateTime.now())
                .build();
        activityRepo.save(activity);

        log.info("2FA enabled for user: {}", email);
    }

    @Transactional
    public void disable2FA(String email) {
        User user = getUserByEmail(email);
        user.setTwoFactorEnabled(false);
        user.setTwoFactorSecret(null);
        userRepo.save(user);

        Activity activity = Activity.builder()
                .type("2FA_DISABLE")
                .description("Two-factor authentication disabled")
                .userId(user.getId())
                .timestamp(LocalDateTime.now())
                .build();
        activityRepo.save(activity);

        log.info("2FA disabled for user: {}", email);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> exportUserData(String email) {
        User user = getUserByEmail(email);

        Map<String, Object> exportData = new HashMap<>();

        exportData.put("user", mapToDTO(user));

        List<Todos> tasks = todosRepo.findByAssignedTo(user);
        exportData.put("tasks", tasks.stream()
                .map(this::mapTaskToExport)
                .collect(Collectors.toList()));

        List<Project> projects = projectRepo.findByCreatedBy(user);
        exportData.put("projects", projects.stream()
                .map(Project::getName)
                .collect(Collectors.toList()));

        List<TimeBlock> timeBlocks = timeBlockRepo.findByUser(user);
        exportData.put("timeBlocks", timeBlocks.stream()
                .map(this::mapTimeBlockToExport)
                .collect(Collectors.toList()));

        List<Activity> activities = activityRepo.findByUserId(user.getId());
        exportData.put("activities", activities.stream()
                .map(this::mapActivityToExport)
                .collect(Collectors.toList()));

        List<DeviceSession> sessions = deviceSessionRepo.findByUser(user);
        exportData.put("sessions", sessions.stream()
                .map(this::mapSessionToExport)
                .collect(Collectors.toList()));

        return exportData;
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = getUserByEmail(email);

        user.setDeletedAt(LocalDateTime.now());
        user.setActive(false);
        userRepo.save(user);

        List<DeviceSession> sessions = deviceSessionRepo.findByUserAndActiveTrue(user);
        for (DeviceSession session : sessions) {
            session.setActive(false);
            session.setRevokedAt(LocalDateTime.now());
            deviceSessionRepo.save(session);
        }

        log.info("Account deleted for user: {}", email);
    }

    @Transactional(readOnly = true)
    public List<UserDTO> searchUsers(String query) {
        if (query == null || query.trim().length() < 2) {
            return Collections.emptyList();
        }
        return userRepo.findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(query, query)
                .stream()
                .limit(10)
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private boolean isCurrentSession(DeviceSession session) {
        Long currentSessionId = SessionContext.getSessionId();
        return currentSessionId != null && currentSessionId.equals(session.getId());
    }

    private String generateSecret() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
        StringBuilder secret = new StringBuilder();
        Random random = new Random();
        for (int i = 0; i < 16; i++) {
            secret.append(chars.charAt(random.nextInt(chars.length())));
        }
        return secret.toString();
    }

    private String convertMapToJson(Map<?, ?> map) {
        if (map == null || map.isEmpty()) {
            return "{}";
        }
        StringBuilder json = new StringBuilder("{");
        map.forEach((key, value) -> {
            json.append("\"").append(key).append("\":");
            if (value instanceof String) {
                json.append("\"").append(value).append("\",");
            } else {
                json.append(value).append(",");
            }
        });
        if (json.charAt(json.length() - 1) == ',') {
            json.deleteCharAt(json.length() - 1);
        }
        json.append("}");
        return json.toString();
    }

    public UserDTO mapToDTO(User user) {
        if (user == null) return null;

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setBio(user.getBio());
        dto.setPhone(user.getPhone());
        dto.setLocation(user.getLocation());
        dto.setCompany(user.getCompany());
        dto.setJobTitle(user.getJobTitle());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setCoverPhoto(user.getCoverPhoto());
        dto.setThemePreference(user.getThemePreference());
        dto.setEmailNotifications(user.isEmailNotifications());
        dto.setPushNotifications(user.isPushNotifications());
        dto.setTwoFactorEnabled(user.isTwoFactorEnabled());
        dto.setTimezone(user.getTimezone());
        dto.setLanguage(user.getLanguage());
        dto.setLastLogin(user.getLastLogin());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setInitials(user.getInitials());

        // Parse social links
        if (user.getSocialLinks() != null && !user.getSocialLinks().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                dto.setSocialLinks(mapper.readValue(user.getSocialLinks(), new TypeReference<Map<String, Object>>() {}));
            } catch (Exception e) {
                dto.setSocialLinks(new HashMap<>());
            }
        } else {
            dto.setSocialLinks(new HashMap<>());
        }

        // Parse preferences
        if (user.getPreferences() != null && !user.getPreferences().isEmpty()) {
            try {
                ObjectMapper mapper = new ObjectMapper();
                dto.setPreferences(mapper.readValue(user.getPreferences(), new TypeReference<Map<String, Object>>() {}));
            } catch (Exception e) {
                dto.setPreferences(new HashMap<>());
            }
        } else {
            dto.setPreferences(new HashMap<>());
        }

        return dto;
    }

    private ActivityDTO mapActivityToDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setType(activity.getType());
        dto.setDescription(activity.getDescription());
        dto.setTimestamp(activity.getTimestamp());

        String type = activity.getType();
        if (type == null) type = "UNKNOWN";

        String icon = "";
        String color = "";

        switch (type) {
            case "PROFILE_UPDATE":
                icon = "Edit2";
                color = "blue";
                break;
            case "AVATAR_UPLOAD":
            case "COVER_UPLOAD":
                icon = "Camera";
                color = "green";
                break;
            case "PASSWORD_CHANGE":
                icon = "Key";
                color = "yellow";
                break;
            case "SESSION_REVOKE":
            case "ALL_SESSIONS_REVOKE":
                icon = "LogOut";
                color = "red";
                break;
            case "2FA_ENABLE":
            case "2FA_VERIFY":
            case "2FA_DISABLE":
                icon = "Lock";
                color = "purple";
                break;
            default:
                icon = "Activity";
                color = "gray";
                break;
        }
        dto.setIcon(icon);
        dto.setColor(color);

        return dto;
    }

    private Map<String, Object> mapTaskToExport(Todos todo) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", todo.getId());
        map.put("title", todo.getItem());
        map.put("description", todo.getDescription());
        map.put("status", todo.getStatus());
        map.put("priority", todo.getPriority());
        map.put("dueDate", todo.getDueDate());
        map.put("createdAt", todo.getCreatedAt());
        map.put("completedAt", todo.getCompletedAt());
        return map;
    }

    private Map<String, Object> mapTimeBlockToExport(TimeBlock timeBlock) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", timeBlock.getId());
        map.put("title", timeBlock.getTitle());
        map.put("startTime", timeBlock.getStartTime());
        map.put("endTime", timeBlock.getEndTime());
        map.put("completed", timeBlock.getCompleted());
        return map;
    }

    private Map<String, Object> mapActivityToExport(Activity activity) {
        Map<String, Object> map = new HashMap<>();
        map.put("type", activity.getType());
        map.put("description", activity.getDescription());
        map.put("timestamp", activity.getTimestamp());
        return map;
    }

    private Map<String, Object> mapSessionToExport(DeviceSession session) {
        Map<String, Object> map = new HashMap<>();
        map.put("deviceName", session.getDeviceName());
        map.put("ipAddress", session.getIpAddress());
        map.put("lastUsed", session.getLastUsed());
        map.put("createdAt", session.getCreatedAt());
        return map;
    }

    private Map<String, Object> getPreferencesMap(User user) {
        if (user.getPreferences() == null || user.getPreferences().isEmpty()) {
            return new HashMap<>();
        }

        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(user.getPreferences(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse preferences JSON", e);
            return new HashMap<>();
        }
    }
}