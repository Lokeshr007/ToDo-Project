package com.loki.todo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineTaskDTO {
    private Long id;
    private String name;
    private LocalDate start;
    private LocalDate end;
    private String status;
    private Integer progress;
    private String priority;
    private String assigneeName;
    private String color;
    private List<Long> dependencies;
}
