package com.loki.todo.security;

import com.loki.todo.model.User;
import com.loki.todo.model.Membership;
import com.loki.todo.repository.UserRepository;
import com.loki.todo.repository.MembershipRepository;
import com.loki.todo.repository.WorkspaceRepository;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import lombok.extern.slf4j.Slf4j;

@Aspect
@Component
@Slf4j
public class WorkspaceSecurityAspect {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MembershipRepository membershipRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Before("@annotation(workspaceAccess)")
    public void validateWorkspace(WorkspaceAccess workspaceAccess) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("User not authenticated");
            throw new RuntimeException("User not authenticated");
        }

        String email = authentication.getName();
        log.debug("Validating workspace access for user: {}", email);

        // Check if user exists in database
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            log.warn("User not found in database: {}. This might happen after database reset.", email);
            // Clear security context and throw exception to force re-login
            SecurityContextHolder.clearContext();
            throw new RuntimeException("User not found. Please login again.");
        }

        Long workspaceId = WorkspaceContext.getWorkspaceId();

        if (workspaceId == null) {
            log.debug("No workspace context set for user: {}", email);
            return;
        }

        // Verify user has access to this workspace
        boolean hasAccess = membershipRepository.existsByUserAndWorkspaceId(user, workspaceId);

        if (!hasAccess) {
            log.warn("User {} does not have access to workspace: {}", email, workspaceId);
            throw new RuntimeException("Access denied to workspace");
        }
    }

    @Around("@annotation(workspaceAccess)")
    public Object aroundWorkspaceAccess(ProceedingJoinPoint joinPoint, WorkspaceAccess workspaceAccess) throws Throwable {
        try {
            validateWorkspace(workspaceAccess);
            return joinPoint.proceed();
        } catch (RuntimeException e) {
            log.error("Workspace access validation failed: {}", e.getMessage());
            throw e;
        }
    }
}