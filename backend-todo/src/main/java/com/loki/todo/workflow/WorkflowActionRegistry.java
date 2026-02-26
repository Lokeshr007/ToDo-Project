package com.loki.todo.workflow;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class WorkflowActionRegistry {

    private final Map<String, WorkflowAction> actions = new HashMap<>();

    @Autowired
    public WorkflowActionRegistry(List<WorkflowAction> actionList) {

        for(WorkflowAction action : actionList){
            actions.put(action.getType(), action);
        }
    }

    public WorkflowAction getAction(String type){
        return actions.get(type);
    }
}