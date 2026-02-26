package com.loki.todo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "membership")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Membership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;

    @ManyToOne
    @JoinColumn(name = "workspace_id")
    @JsonIgnoreProperties({"members", "projects"})
    private Workspace workspace;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "joined_at")
    private LocalDateTime joinedAt;

    @Column(name = "last_active")
    private LocalDateTime lastActive;

    @Column(name = "is_active")
    private Boolean active = true;

    public enum Role {
        ADMIN, MEMBER, VIEWER
    }

    @PrePersist
    protected void onCreate() {
        joinedAt = LocalDateTime.now();
        lastActive = LocalDateTime.now();
        if (active == null) active = true;
    }

    // Helper method to safely get active status
    public boolean isActive() {
        return active != null && active;
    }
}