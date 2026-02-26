package com.loki.todo.workflow;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class WorkflowEvent {
    private WorkflowEventType type;
    private Object source;
    private Object oldValue;
    private Object newValue;
    private Object metadata;  // Additional field for extra data
    private LocalDateTime timestamp;

    // Basic constructor with just type and source
    public WorkflowEvent(WorkflowEventType type, Object source) {
        this.type = type;
        this.source = source;
        this.timestamp = LocalDateTime.now();
    }

    // Constructor with type, source, and metadata (for single extra value)
    public WorkflowEvent(WorkflowEventType type, Object source, Object metadata) {
        this.type = type;
        this.source = source;
        this.metadata = metadata;
        this.timestamp = LocalDateTime.now();
    }

    // Constructor with type, source, old value, and new value
    public WorkflowEvent(WorkflowEventType type, Object source, Object oldValue, Object newValue) {
        this.type = type;
        this.source = source;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.timestamp = LocalDateTime.now();
    }

    // Constructor with all fields
    public WorkflowEvent(WorkflowEventType type, Object source, Object oldValue, Object newValue, Object metadata) {
        this.type = type;
        this.source = source;
        this.oldValue = oldValue;
        this.newValue = newValue;
        this.metadata = metadata;
        this.timestamp = LocalDateTime.now();
    }
}