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
@Table(name = "workspace")
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Workspace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    private String description;

    private String logoUrl;

    @Enumerated(EnumType.STRING)
    private WorkspaceType type = WorkspaceType.TEAM;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Membership> members = new ArrayList<>();

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Project> projects = new ArrayList<>();

    @OneToMany(mappedBy = "workspace", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Label> labels = new ArrayList<>();

    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt;

    private boolean active = true;

    public enum WorkspaceType {
        PERSONAL, TEAM, ENTERPRISE
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public void addMember(User user, Membership.Role role) {
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setWorkspace(this);
        membership.setRole(role);
        membership.setJoinedAt(LocalDateTime.now());
        membership.setActive(true);
        this.members.add(membership);
    }

    public boolean isMember(User user) {
        return members.stream()
                .anyMatch(m -> m.getUser() != null &&
                        m.getUser().equals(user) &&
                        m.getActive() != null &&
                        m.getActive());
    }

    public boolean isAdmin(User user) {
        return members.stream()
                .anyMatch(m -> m.getUser() != null &&
                        m.getUser().equals(user) &&
                        m.getRole() == Membership.Role.ADMIN &&
                        m.getActive() != null &&
                        m.getActive());
    }
}