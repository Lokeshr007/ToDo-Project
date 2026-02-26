// BACKEND-TODO/SRC/main/java/com/loki/todo/dto/AIPlanDailyGoalDTO.java
package com.loki.todo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AIPlanDailyGoalDTO {
    private Integer day;
    private List<String> topics;
    private Integer hours;
    private List<String> tasks;
}