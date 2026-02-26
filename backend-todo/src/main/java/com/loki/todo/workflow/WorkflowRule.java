package com.loki.todo.workflow;

import com.loki.todo.model.Workspace;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkflowRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private WorkflowEventType eventType;

    // simple condition example
    private String conditionKey;
    private String conditionValue;

    // action
    private String actionType;

    @ManyToOne
    private Workspace workspace;

    // getters setters
    @Column(length = 1000)
    private String expression;

}