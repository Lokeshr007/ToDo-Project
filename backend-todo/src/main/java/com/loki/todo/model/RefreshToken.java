package com.loki.todo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "refresh_tokens")
public class RefreshToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true)
    private String token;

    private LocalDateTime expiry;

    private String deviceName;

    private String ipAddress;

    private String userAgent;

    private LocalDateTime lastUsed;

    @Column(nullable = false)
    private boolean revoked = false;

    @Column(name = "revoked_at")
    private LocalDateTime revokedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne
    @JoinColumn(name = "device_session_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private DeviceSession deviceSession;

    @PrePersist
    protected void onCreate() {
        if (lastUsed == null) {
            lastUsed = LocalDateTime.now();
        }
    }

    public void revoke() {
        this.revoked = true;
        this.revokedAt = LocalDateTime.now();
    }

    public boolean isValid() {
        return !revoked && expiry != null && expiry.isAfter(LocalDateTime.now());
    }
}