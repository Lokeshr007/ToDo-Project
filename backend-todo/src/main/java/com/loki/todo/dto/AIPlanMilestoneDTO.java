// BACKEND-TODO/SRC/main/java/com/loki/todo/dto/AIPlanMilestoneDTO.java
package com.loki.todo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIPlanMilestoneDTO {
    private Integer day;
    private String description;
}