package com.loki.todo.dto;

import com.loki.todo.model.Comment;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Data
@NoArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private Long todoId;
    private Map<String, Object> author;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentResponse fromEntity(Comment comment) {
        if (comment == null) return null;
        
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        if (comment.getTodo() != null) {
            response.setTodoId(comment.getTodo().getId());
        }
        if (comment.getAuthor() != null) {
            Map<String, Object> authorMap = new HashMap<>();
            authorMap.put("id", comment.getAuthor().getId());
            authorMap.put("name", comment.getAuthor().getName());
            authorMap.put("email", comment.getAuthor().getEmail());
            authorMap.put("profilePicture", comment.getAuthor().getProfilePicture());
            response.setAuthor(authorMap);
        }
        response.setCreatedAt(comment.getCreatedAt());
        response.setUpdatedAt(comment.getUpdatedAt());
        
        return response;
    }
}
