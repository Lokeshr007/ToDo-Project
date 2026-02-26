// BACKEND-TODO/SRC/main/java/com/loki/todo/dto/ChatMessageDTO.java
package com.loki.todo.dto;

import lombok.Data;

@Data
public class ChatMessageDTO {
    private String content;
    private String history;
    private Object context;
}