package com.loki.todo.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Slf4j
@Component
@Order(1) // Ensure it runs early in the filter chain
public class WorkspaceFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        // Try both header formats
        String workspaceIdHeader = request.getHeader("X-Workspace-ID");
        if (workspaceIdHeader == null) {
            workspaceIdHeader = request.getHeader("x-workspace-id");
        }

        log.debug("WorkspaceFilter - Request: {} {}, Header: {}",
                request.getMethod(), request.getRequestURI(), workspaceIdHeader);

        // Check if header exists and is valid
        if (workspaceIdHeader != null &&
                !workspaceIdHeader.isEmpty() &&
                !"undefined".equalsIgnoreCase(workspaceIdHeader) &&
                !"null".equalsIgnoreCase(workspaceIdHeader)) {

            try {
                Long workspaceId = Long.valueOf(workspaceIdHeader);
                WorkspaceContext.setWorkspaceId(workspaceId);
                request.setAttribute("workspaceId", workspaceId);
                log.debug("Set workspace context to: {}", workspaceId);
            } catch (NumberFormatException e) {
                log.warn("Invalid workspace ID format: {}", workspaceIdHeader);
            }
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Clear after request completes
            WorkspaceContext.clear();
            log.debug("Cleared workspace context");
        }
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip filter for auth endpoints and public endpoints
        boolean shouldSkip = path.startsWith("/api/auth") ||
                path.startsWith("/login") ||
                path.startsWith("/oauth2") ||
                path.startsWith("/public") ||
                path.equals("/error");

        if (shouldSkip) {
            log.debug("Skipping WorkspaceFilter for: {}", path);
        }
        return shouldSkip;
    }
}