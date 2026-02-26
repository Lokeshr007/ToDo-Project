package com.loki.todo.util;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.loki.todo.model.AIContext;
import com.loki.todo.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
@RequiredArgsConstructor
public class ContextManager {

    private final ObjectMapper objectMapper;
    private final Map<String, AIContext> contextCache = new ConcurrentHashMap<>();

    public AIContext createContext(String sessionId, User user) {
        AIContext context = new AIContext();
        context.setSessionId(sessionId);
        context.setUser(user);
        context.setLearningStyle("VISUAL");
        context.setAttentionSpan(45);
        context.setStrengths(new ArrayList<>());
        context.setWeaknesses(new ArrayList<>());
        context.setProgressRate(0.0);
        context.setInteractionCount(0);
        context.setLastInteraction(LocalDateTime.now());
        context.setContextData("{}");
        context.setUserPreferences("{}");

        contextCache.put(sessionId, context);
        return context;
    }

    public AIContext getContext(String sessionId) {
        return contextCache.get(sessionId);
    }

    public void updateContext(String sessionId, Map<String, Object> updates) {
        AIContext context = contextCache.get(sessionId);
        if (context != null) {
            updates.forEach((key, value) -> {
                switch (key) {
                    case "learningStyle":
                        if (value instanceof String) {
                            context.setLearningStyle((String) value);
                        }
                        break;
                    case "attentionSpan":
                        if (value instanceof Integer) {
                            context.setAttentionSpan((Integer) value);
                        } else if (value instanceof Number) {
                            context.setAttentionSpan(((Number) value).intValue());
                        }
                        break;
                    case "progressRate":
                        if (value instanceof Double) {
                            context.setProgressRate((Double) value);
                        } else if (value instanceof Number) {
                            context.setProgressRate(((Number) value).doubleValue());
                        }
                        break;
                    case "strengths":
                        if (value instanceof List) {
                            @SuppressWarnings("unchecked")
                            List<String> strengths = (List<String>) value;
                            context.setStrengths(strengths);
                        }
                        break;
                    case "weaknesses":
                        if (value instanceof List) {
                            @SuppressWarnings("unchecked")
                            List<String> weaknesses = (List<String>) value;
                            context.setWeaknesses(weaknesses);
                        }
                        break;
                }
            });
            context.setLastInteraction(LocalDateTime.now());
            context.setInteractionCount(context.getInteractionCount() + 1);
            contextCache.put(sessionId, context);
        }
    }

    public void addMessageToContext(String sessionId, String role, String content, Map<String, Object> metadata) {
        AIContext context = contextCache.get(sessionId);
        if (context != null) {
            try {
                Map<String, Object> contextData = parseContextData(context.getContextData());
                List<Map<String, Object>> messages = getMessagesFromContextData(contextData);

                Map<String, Object> message = new HashMap<>();
                message.put("role", role);
                message.put("content", content);
                message.put("timestamp", LocalDateTime.now().toString());
                message.put("metadata", metadata != null ? metadata : new HashMap<>());

                messages.add(message);
                contextData.put("messages", messages);
                contextData.put("lastUpdated", LocalDateTime.now().toString());

                context.setContextData(objectMapper.writeValueAsString(contextData));
                contextCache.put(sessionId, context);
            } catch (Exception e) {
                log.error("Failed to add message to context", e);
            }
        }
    }

    public List<Map<String, Object>> getMessageHistory(String sessionId) {
        AIContext context = contextCache.get(sessionId);
        if (context == null) {
            return new ArrayList<>();
        }

        try {
            Map<String, Object> contextData = parseContextData(context.getContextData());
            return getMessagesFromContextData(contextData);
        } catch (Exception e) {
            log.error("Failed to get message history", e);
            return new ArrayList<>();
        }
    }

    private Map<String, Object> parseContextData(String contextDataStr) {
        if (contextDataStr == null || contextDataStr.isEmpty() || contextDataStr.equals("{}")) {
            return new HashMap<>();
        }

        try {
            return objectMapper.readValue(contextDataStr, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Failed to parse context data", e);
            return new HashMap<>();
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getMessagesFromContextData(Map<String, Object> contextData) {
        Object messagesObj = contextData.get("messages");
        if (messagesObj instanceof List) {
            return (List<Map<String, Object>>) messagesObj;
        }
        return new ArrayList<>();
    }

    public void updateUserPreferences(String sessionId, Map<String, Object> preferences) {
        AIContext context = contextCache.get(sessionId);
        if (context != null) {
            try {
                context.setUserPreferences(objectMapper.writeValueAsString(preferences));
                contextCache.put(sessionId, context);
            } catch (Exception e) {
                log.error("Failed to update user preferences", e);
            }
        }
    }

    public Map<String, Object> getUserPreferences(String sessionId) {
        AIContext context = contextCache.get(sessionId);
        if (context != null && context.getUserPreferences() != null && !context.getUserPreferences().isEmpty()) {
            try {
                return objectMapper.readValue(context.getUserPreferences(), new TypeReference<Map<String, Object>>() {});
            } catch (Exception e) {
                log.error("Failed to parse user preferences", e);
            }
        }
        return new HashMap<>();
    }

    public void clearContext(String sessionId) {
        contextCache.remove(sessionId);
    }

    public boolean hasContext(String sessionId) {
        return contextCache.containsKey(sessionId);
    }

    public Map<String, Object> getContextSummary(String sessionId) {
        AIContext context = contextCache.get(sessionId);
        if (context == null) return new HashMap<>();

        Map<String, Object> summary = new HashMap<>();
        summary.put("sessionId", context.getSessionId());
        summary.put("learningStyle", context.getLearningStyle());
        summary.put("attentionSpan", context.getAttentionSpan());
        summary.put("progressRate", context.getProgressRate());
        summary.put("interactionCount", context.getInteractionCount());
        summary.put("lastInteraction", context.getLastInteraction() != null ?
                context.getLastInteraction().toString() : null);
        summary.put("strengths", context.getStrengths() != null ?
                new ArrayList<>(context.getStrengths()) : new ArrayList<>());
        summary.put("weaknesses", context.getWeaknesses() != null ?
                new ArrayList<>(context.getWeaknesses()) : new ArrayList<>());

        if (context.getCurrentPlan() != null) {
            summary.put("currentPlan", context.getCurrentPlan().getTitle());
        }

        return summary;
    }

    public void mergeContext(String sessionId, AIContext newContext) {
        AIContext existing = contextCache.get(sessionId);
        if (existing != null) {
            if (newContext.getLearningStyle() != null) {
                existing.setLearningStyle(newContext.getLearningStyle());
            }
            if (newContext.getAttentionSpan() != null) {
                existing.setAttentionSpan(newContext.getAttentionSpan());
            }
            if (newContext.getProgressRate() != null) {
                existing.setProgressRate(newContext.getProgressRate());
            }
            if (newContext.getStrengths() != null) {
                existing.setStrengths(new ArrayList<>(newContext.getStrengths()));
            }
            if (newContext.getWeaknesses() != null) {
                existing.setWeaknesses(new ArrayList<>(newContext.getWeaknesses()));
            }
            existing.setLastInteraction(LocalDateTime.now());
            existing.setInteractionCount(existing.getInteractionCount() + 1);
            contextCache.put(sessionId, existing);
        }
    }
}