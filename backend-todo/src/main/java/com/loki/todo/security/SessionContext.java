package com.loki.todo.security;

public class SessionContext {
    private static final ThreadLocal<Long> currentSessionId = new ThreadLocal<>();

    public static void setSessionId(Long sessionId) {
        currentSessionId.set(sessionId);
    }

    public static Long getSessionId() {
        return currentSessionId.get();
    }

    public static void clear() {
        currentSessionId.remove();
    }
}
