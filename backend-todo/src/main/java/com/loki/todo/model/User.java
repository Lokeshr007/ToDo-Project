package com.loki.todo.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users", indexes = {
        @Index(name = "idx_user_email", columnList = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    private String password;

    private String bio;

    private String phone;

    private String location;

    private String company;

    @Column(name = "job_title")
    private String jobTitle;

    @Column(name = "profile_picture")
    private String profilePicture;

    @Column(name = "cover_photo")
    private String coverPhoto;

    @Column(name = "theme_preference")
    private String themePreference = "light";

    private boolean verified;

    private String otp;

    @Column(name = "otp_expiry")
    private LocalDateTime otpExpiry;

    private String provider;

    @Column(name = "provider_id")
    private String providerId;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "email_notifications")
    private Boolean emailNotifications = true;

    @Column(name = "push_notifications")
    private Boolean pushNotifications = true;

    @Column(name = "two_factor_enabled")
    private Boolean twoFactorEnabled = false;

    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    @Column(name = "account_locked")
    private Boolean accountLocked = false;

    @Column(name = "account_locked_until")
    private LocalDateTime accountLockedUntil;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "last_password_change")
    private LocalDateTime lastPasswordChange;

    @Column(name = "password_reset_token")
    private String passwordResetToken;

    @Column(name = "password_reset_expiry")
    private LocalDateTime passwordResetExpiry;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "social_links")
    private String socialLinks; // JSON string

    @Column(name = "preferences")
    private String preferences; // JSON string for user preferences

    @Column(name = "timezone")
    private String timezone = "UTC";

    @Column(name = "language")
    private String language = "en";

    @Column(name = "active")
    private Boolean active = true;  // Add this field

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<DeviceSession> deviceSessions = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<RefreshToken> refreshTokens = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Membership> memberships = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (emailNotifications == null) emailNotifications = true;
        if (pushNotifications == null) pushNotifications = true;
        if (themePreference == null) themePreference = "light";
        if (timezone == null) timezone = "UTC";
        if (language == null) language = "en";
        if (preferences == null) preferences = "{}";
        if (socialLinks == null) socialLinks = "{}";
        if (active == null) active = true;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Explicit getters and setters for boolean fields
    public boolean isEmailNotifications() {
        return emailNotifications != null ? emailNotifications : true;
    }

    public boolean isPushNotifications() {
        return pushNotifications != null ? pushNotifications : true;
    }

    public boolean isTwoFactorEnabled() {
        return twoFactorEnabled != null ? twoFactorEnabled : false;
    }

    public boolean isAccountLocked() {
        return accountLocked != null ? accountLocked : false;
    }

    public boolean isActive() {
        return active != null ? active : true;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getInitials() {
        if (name != null && !name.isEmpty()) {
            String[] parts = name.split(" ");
            if (parts.length >= 2) {
                return (parts[0].substring(0, 1) + parts[1].substring(0, 1)).toUpperCase();
            }
            return name.substring(0, 1).toUpperCase();
        }
        if (email != null && !email.isEmpty()) {
            return email.substring(0, 1).toUpperCase();
        }
        return "U";
    }
}