package com.loki.todo.service;

import com.loki.todo.dto.MemberDTO;
import com.loki.todo.model.*;
import com.loki.todo.repository.MembershipRepository;
import com.loki.todo.repository.UserRepository;
import com.loki.todo.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class MemberService {

    private final MembershipRepository membershipRepo;
    private final WorkspaceRepository workspaceRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public List<MemberDTO> getWorkspaceMembers(Long workspaceId, String email) {
        // Validate workspace exists
        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // Validate user has access
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isMember = membershipRepo.existsByUserAndWorkspace(user, workspace);
        if (!isMember) {
            throw new RuntimeException("Access denied");
        }

        // Get all active members
        List<Membership> memberships = membershipRepo.findByWorkspaceAndActiveTrue(workspace);

        return memberships.stream()
                .map(MemberDTO::fromEntity)
                .collect(Collectors.toList());
    }

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