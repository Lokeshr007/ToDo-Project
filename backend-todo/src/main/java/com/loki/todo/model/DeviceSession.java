package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import net.minidev.json.annotate.JsonIgnore;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "device_sessions")
public class DeviceSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    private String deviceName;

    private String deviceType;

    private String browser;

    private String os;

    @Column(name = "ip_address")
    private String ipAddress;

    private String location;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "last_used")
    private LocalDateTime lastUsed;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    private boolean active = true;

    private boolean trusted = false;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    // Add this field to DeviceSession.java
    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastUsed = LocalDateTime.now();
        lastActive = LocalDateTime.now();
    }



}