package com.loki.todo.workflow;

import com.loki.todo.model.Todos;
// Remove any import for com.loki.todo.model.Status

public class CreateRevisionAction {

    public void execute(WorkflowEvent event) {
        if (event.getSource() instanceof Todos) {
            Todos todo = (Todos) event.getSource();

            // Use Todos.Status instead of the other Status enum
            if (todo.getStatus() == Todos.Status.COMPLETED) {
                // Create revision logic
                System.out.println("Creating revision for completed task: " + todo.getItem());
            }
        }
    }
}