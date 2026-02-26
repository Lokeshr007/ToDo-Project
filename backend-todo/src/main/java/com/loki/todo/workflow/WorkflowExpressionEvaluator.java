package com.loki.todo.workflow;

import com.loki.todo.model.Todos;
import org.springframework.stereotype.Component;

@Component
public class WorkflowExpressionEvaluator {

    public boolean evaluate(String expression, Todos todo){

        if(expression == null || expression.isBlank()){
            return true;
        }

        // VERY BASIC parsing example

        if(expression.contains("AND")){

            String[] parts = expression.split("AND");

            for(String part : parts){

                if(!evaluateSingle(part.trim(), todo)){
                    return false;
                }
            }
            return true;
        }

        return evaluateSingle(expression, todo);
    }

    private boolean evaluateSingle(String condition, Todos todo){

        // Example format:
        // board == 'Completed'

        String[] tokens = condition.split("==");

        if(tokens.length != 2) return false;

        String field = tokens[0].trim();
        String value = tokens[1]
                .trim()
                .replace("'", "");

        switch(field){

            case "board":
                return todo.getBoard()
                        .getName()
                        .equalsIgnoreCase(value);

            case "status":
                return todo.getStatus()
                        .name()
                        .equalsIgnoreCase(value);

            default:
                return false;
        }
    }
}