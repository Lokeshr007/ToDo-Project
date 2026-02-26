package com.loki.todo.workflow;


import com.loki.todo.model.Todos;
import org.springframework.stereotype.Component;

@Component
public class NotifyMentorAction implements WorkflowAction {

    @Override
    public String getType() {
        return "NOTIFY_MENTOR";
    }

    @Override
    public void execute(WorkflowRule rule, Todos todo) {
        System.out.println("Mentor notified for: " + todo.getItem());
    }
}