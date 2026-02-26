// BACKEND-TODO/SRC/main/java/com/loki/todo/dto/UserDTO.java
package com.loki.todo.dto;

import com.loki.todo.model.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private Long id;
    private String name;
    private String email;
    private String bio;
    private String phone;
    private String location;
    private String company;
    private String jobTitle;
    private String profilePicture;
    private String coverPhoto;
    private String themePreference;
    private boolean emailNotifications;
    private boolean pushNotifications;
    private boolean twoFactorEnabled;
    private String timezone;
    private String language;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String initials;
    private Map<String, Object> socialLinks;
    private Map<String, Object> preferences;

    public static UserDTO fromEntity(User user) {
        if (user == null) return null;

        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .bio(user.getBio())
                .phone(user.getPhone())
                .location(user.getLocation())
                .company(user.getCompany())
                .jobTitle(user.getJobTitle())
                .profilePicture(user.getProfilePicture())
                .coverPhoto(user.getCoverPhoto())
                .themePreference(user.getThemePreference())
                .emailNotifications(user.isEmailNotifications())
                .pushNotifications(user.isPushNotifications())
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .timezone(user.getTimezone())
                .language(user.getLanguage())
                .lastLogin(user.getLastLogin())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .initials(user.getInitials())
                .build();
    }
}