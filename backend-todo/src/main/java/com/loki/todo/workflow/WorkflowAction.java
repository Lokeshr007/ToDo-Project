package com.loki.todo.workflow;

import com.loki.todo.model.Todos;

public interface WorkflowAction {

    String getType();  // actionType string

    void execute(WorkflowRule rule, Todos todo);
}