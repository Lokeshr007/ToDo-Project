package com.loki.todo.controller;

import com.loki.todo.dto.AttachmentResponse;
import com.loki.todo.model.Attachment;
import com.loki.todo.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/attachments")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping("/upload/{todoId}")
    public ResponseEntity<?> uploadFile(
            @PathVariable Long todoId,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        try {
            String email = authentication.getName();
            Attachment attachment = attachmentService.uploadFile(todoId, file, email);
            return ResponseEntity.ok(AttachmentResponse.fromEntity(attachment));
        } catch (Exception e) {
            log.error("Upload failed", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/todo/{todoId}")
    public ResponseEntity<?> getAttachments(@PathVariable Long todoId) {
        try {
            List<Attachment> attachments = attachmentService.getAttachmentsByTodo(todoId);
            List<AttachmentResponse> response = attachments.stream()
                    .map(AttachmentResponse::fromEntity)
                    .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id) {
        try {
            Attachment attachment = attachmentService.getAttachmentById(id);
            Path filePath = attachmentService.getFilePath(attachment);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new RuntimeException("File not found on disk");
            }

            String contentType = attachment.getFileType();
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAttachment(@PathVariable Long id, Authentication authentication) {
        try {
            String email = authentication.getName();
            attachmentService.deleteAttachment(id, email);
            return ResponseEntity.ok(Map.of("message", "Attachment deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
