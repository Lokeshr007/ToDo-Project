// BACKEND-TODO/SRC/main/java/com/loki/todo/dto/RefineTasksRequest.java
package com.loki.todo.dto;

import lombok.Data;
import java.util.List;

@Data
public class RefineTasksRequest {
    private List<Long> taskIds;
    private String instructions;
}