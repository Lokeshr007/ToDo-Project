package com.loki.todo.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
class AIContextMessageDTO {
    private String role;
    private String content;
    private LocalDateTime timestamp;
}
