package com.loki.todo.dto;

import com.loki.todo.model.Attachment;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AttachmentResponse {
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private Long todoId;
    private String uploadedBy;
    private LocalDateTime uploadedAt;
    private String downloadUrl;

    public static AttachmentResponse fromEntity(Attachment attachment) {
        AttachmentResponse response = new AttachmentResponse();
        response.setId(attachment.getId());
        response.setFileName(attachment.getFileName());
        response.setFileType(attachment.getFileType());
        response.setFileSize(attachment.getFileSize());
        response.setTodoId(attachment.getTodo() != null ? attachment.getTodo().getId() : null);
        response.setUploadedBy(attachment.getUploadedBy() != null ? attachment.getUploadedBy().getName() : "Unknown");
        response.setUploadedAt(attachment.getUploadedAt());
        // URL for the frontend to download the file
        response.setDownloadUrl("/api/attachments/download/" + attachment.getId());
        return response;
    }
}
