// BACKEND-TODO/SRC/main/java/com/loki/todo/dto/AIPlanRequestDTO.java
package com.loki.todo.dto;

import lombok.Data;

@Data
public class AIPlanRequestDTO {
    private AIPlanDTO plan;
    private Boolean regenerate;
}
