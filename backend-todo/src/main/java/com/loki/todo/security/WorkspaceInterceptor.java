package com.loki.todo.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class WorkspaceInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Extract workspace ID from header (frontend will send it)
        String workspaceId = request.getHeader("X-Workspace-ID");
        if (workspaceId != null) {
            try {
                WorkspaceContext.setWorkspaceId(Long.parseLong(workspaceId));
            } catch (NumberFormatException e) {
                // Invalid workspace ID
            }
        }
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response,
                                Object handler, Exception ex) {
        WorkspaceContext.clear();
    }
}