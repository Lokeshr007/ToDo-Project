package com.loki.todo.service;

import com.loki.todo.dto.MemberDTO;
import com.loki.todo.dto.WorkspaceDTO;
import com.loki.todo.dto.WorkspaceSummaryDTO;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final UserRepository userRepo;
    private final WorkspaceRepository workspaceRepo;
    private final MembershipRepository membershipRepo;
    private final ProjectRepository projectRepo;

    // ===== GET USER WORKSPACES =====

    public List<Workspace> getUserWorkspaces(String email) {
        try {
            log.debug("Getting workspaces for user: {}", email);

            User user = userRepo.findByEmail(email).orElse(null);

            if (user == null) {
                log.warn("User not found in database: {}", email);
                return Collections.emptyList();
            }

            List<Membership> memberships = membershipRepo.findByUser(user);

            return memberships.stream()
                    .filter(m -> m.getActive() != null && m.getActive())
                    .map(Membership::getWorkspace)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting workspaces for user: {}", email, e);
            return Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public List<WorkspaceSummaryDTO> getUserWorkspaceDTOs(String email) {
        List<Workspace> workspaces = getUserWorkspaces(email);
        return workspaces.stream()
                .map(WorkspaceSummaryDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // ===== GET WORKSPACE BY ID =====

    @Transactional(readOnly = true)
    public WorkspaceDTO getWorkspace(Long workspaceId, String email) {
        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember = membershipRepo.existsByUserAndWorkspace(user, workspace);
        if (!isMember) {
            throw new RuntimeException("Access denied");
        }

        long memberCount = membershipRepo.countByWorkspace(workspace);
        long projectCount = workspace.getProjects() != null ? workspace.getProjects().size() : 0;

        return WorkspaceDTO.fromEntity(workspace, memberCount, projectCount);
    }

    // ===== CREATE WORKSPACE =====

    @Transactional
    public WorkspaceDTO createWorkspace(String name, String description, String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workspace workspace = new Workspace();
        workspace.setName(name);
        workspace.setDescription(description != null ? description : "");
        workspace.setOwner(user);
        workspace.setCreatedAt(LocalDateTime.now());

        Workspace savedWorkspace = workspaceRepo.save(workspace);

        // Add creator as admin
        Membership membership = new Membership();
        membership.setUser(user);
        membership.setWorkspace(savedWorkspace);
        membership.setRole(Membership.Role.ADMIN);
        membership.setJoinedAt(LocalDateTime.now());
        membership.setActive(true);
        membershipRepo.save(membership);

        log.info("Workspace created: {} by user: {}", savedWorkspace.getId(), email);

        return WorkspaceDTO.fromEntity(savedWorkspace, 1L, 0L);
    }

    // ===== UPDATE WORKSPACE =====

    @Transactional
    public WorkspaceDTO updateWorkspace(Long workspaceId, Map<String, String> updates, String email) {
        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Membership membership = membershipRepo.findByUserAndWorkspace(user, workspace)
                .orElseThrow(() -> new RuntimeException("Access denied"));

        if (membership.getRole() != Membership.Role.ADMIN) {
            throw new RuntimeException("Only workspace admins can update workspace");
        }

        if (updates.containsKey("name")) {
            workspace.setName(updates.get("name"));
        }
        if (updates.containsKey("description")) {
            workspace.setDescription(updates.get("description"));
        }

        workspace.setUpdatedAt(LocalDateTime.now());
        Workspace updatedWorkspace = workspaceRepo.save(workspace);

        long memberCount = membershipRepo.countByWorkspace(workspace);
        long projectCount = workspace.getProjects() != null ? workspace.getProjects().size() : 0;

        log.info("Workspace updated: {} by user: {}", workspaceId, email);

        return WorkspaceDTO.fromEntity(updatedWorkspace, memberCount, projectCount);
    }
    // ===== DELETE WORKSPACE =====

    @Transactional
    public void deleteWorkspace(Long workspaceId, String email) {
        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Membership membership = membershipRepo.findByUserAndWorkspace(user, workspace)
                .orElseThrow(() -> new RuntimeException("Access denied"));

        if (membership.getRole() != Membership.Role.ADMIN) {
            throw new RuntimeException("Only workspace admins can delete workspace");
        }

        workspaceRepo.delete(workspace);
        log.info("Workspace deleted: {} by user: {}", workspaceId, email);
    }
    // ===== GET WORKSPACE MEMBERS =====

    @Transactional(readOnly = true)
    public List<MemberDTO> getWorkspaceMembers(Long workspaceId, String email) {
        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // Validate user has access
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!membershipRepo.existsByUserAndWorkspace(user, workspace)) {
            throw new RuntimeException("You don't have access to this workspace");
        }

        List<Membership> memberships = membershipRepo.findByWorkspaceAndActiveTrue(workspace);

        return memberships.stream()
                .map(membership -> MemberDTO.fromEntity(membership))
                .collect(Collectors.toList());
    }

    // ===== ADD WORKSPACE MEMBER =====

    @Transactional
    public MemberDTO addWorkspaceMember(Long workspaceId, String userEmail, String role, String invitedByEmail) {
        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // Validate inviter is admin
        User inviter = userRepo.findByEmail(invitedByEmail)
                .orElseThrow(() -> new RuntimeException("Inviter not found"));

        Membership inviterMembership = membershipRepo.findByUserAndWorkspace(inviter, workspace)
                .orElseThrow(() -> new RuntimeException("Inviter not in workspace"));

        if (inviterMembership.getRole() != Membership.Role.ADMIN) {
            throw new RuntimeException("Only workspace admins can add members");
        }

        // Find user to add
        User newUser = userRepo.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + userEmail));

        // Check if already a member
        if (membershipRepo.existsByUserAndWorkspace(newUser, workspace)) {
            throw new RuntimeException("User is already a member of this workspace");
        }

        // Create membership
        Membership.Role memberRole;
        try {
            memberRole = Membership.Role.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            memberRole = Membership.Role.MEMBER;
        }

        Membership membership = new Membership();
        membership.setUser(newUser);
        membership.setWorkspace(workspace);
        membership.setRole(memberRole);
        membership.setJoinedAt(LocalDateTime.now());
        membership.setActive(true);

        Membership savedMembership = membershipRepo.save(membership);

        log.info("User {} added to workspace {} by {}", userEmail, workspaceId, invitedByEmail);

        return MemberDTO.fromEntity(savedMembership);
    }

    // ===== REMOVE WORKSPACE MEMBER =====

    @Transactional
    public void removeWorkspaceMember(Long workspaceId, Long userId, String email) {
        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // Validate remover is admin
        User remover = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Membership removerMembership = membershipRepo.findByUserAndWorkspace(remover, workspace)
                .orElseThrow(() -> new RuntimeException("You don't have access to this workspace"));

        if (removerMembership.getRole() != Membership.Role.ADMIN) {
            throw new RuntimeException("Only workspace admins can remove members");
        }

        // Find user to remove
        User userToRemove = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Cannot remove the owner
        if (workspace.getOwner() != null && workspace.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Cannot remove the workspace owner");
        }

        Membership membership = membershipRepo.findByUserAndWorkspace(userToRemove, workspace)
                .orElseThrow(() -> new RuntimeException("User is not a member of this workspace"));

        membershipRepo.delete(membership);

        log.info("User {} removed from workspace {} by {}", userId, workspaceId, email);
    }

    // ===== UPDATE MEMBER ROLE =====

    @Transactional
    public MemberDTO updateMemberRole(Long workspaceId, Long userId, String newRole, String email) {
        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // Validate updater is admin
        User updater = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Membership updaterMembership = membershipRepo.findByUserAndWorkspace(updater, workspace)
                .orElseThrow(() -> new RuntimeException("You don't have access to this workspace"));

        if (updaterMembership.getRole() != Membership.Role.ADMIN) {
            throw new RuntimeException("Only workspace admins can update member roles");
        }

        // Find user to update
        User userToUpdate = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Membership membership = membershipRepo.findByUserAndWorkspace(userToUpdate, workspace)
                .orElseThrow(() -> new RuntimeException("User is not a member of this workspace"));

        // Cannot change role of owner
        if (workspace.getOwner() != null && workspace.getOwner().getId().equals(userId)) {
            throw new RuntimeException("Cannot change the workspace owner's role");
        }

        Membership.Role role;
        try {
            role = Membership.Role.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + newRole);
        }

        membership.setRole(role);
        Membership updatedMembership = membershipRepo.save(membership);

        log.info("User {} role updated to {} in workspace {} by {}", userId, newRole, workspaceId, email);

        return MemberDTO.fromEntity(updatedMembership);
    }
}