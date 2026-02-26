package com.loki.todo.security;

public class WorkspaceContext {
    private static final ThreadLocal<Long> currentWorkspace = new ThreadLocal<>();

    public static void setWorkspaceId(Long workspaceId) {
        currentWorkspace.set(workspaceId);
    }

    public static Long getWorkspaceId() {
        return currentWorkspace.get();
    }

    public static void clear() {
        currentWorkspace.remove();
    }
}