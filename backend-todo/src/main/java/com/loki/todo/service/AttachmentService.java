package com.loki.todo.service;

import com.loki.todo.model.Attachment;
import com.loki.todo.model.Todos;
import com.loki.todo.model.User;
import com.loki.todo.repository.AttachmentRepository;
import com.loki.todo.repository.TodosRepository;
import com.loki.todo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepo;
    private final TodosRepository todoRepo;
    private final UserRepository userRepo;

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    @Transactional
    public Attachment uploadFile(Long todoId, MultipartFile file, String email) throws IOException {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        // Ensure upload directory exists
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        // Generate a unique filename to avoid collisions
        String originalFilename = file.getOriginalFilename();
        String uniqueFileName = UUID.randomUUID().toString() + "_" + originalFilename;
        Path targetLocation = uploadPath.resolve(uniqueFileName);

        // Copy file to target location
        Files.copy(file.getInputStream(), targetLocation);

        // Create metadata record
        Attachment attachment = new Attachment();
        attachment.setFileName(originalFilename);
        attachment.setFilePath(uniqueFileName); // Store relative path/filename
        attachment.setFileType(file.getContentType());
        attachment.setFileSize(file.getSize());
        attachment.setTodo(todo);
        attachment.setUploadedBy(user);
        attachment.setUploadedAt(LocalDateTime.now());

        log.info("File uploaded: {} for task: {} by user: {}", originalFilename, todoId, email);
        return attachmentRepo.save(attachment);
    }

    @Transactional(readOnly = true)
    public List<Attachment> getAttachmentsByTodo(Long todoId) {
        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        return attachmentRepo.findByTodo(todo);
    }

    @Transactional(readOnly = true)
    public Attachment getAttachmentById(Long id) {
        return attachmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
    }

    @Transactional
    public void deleteAttachment(Long id, String email) throws IOException {
        Attachment attachment = attachmentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));

        // Optional: Check if user has access to the workspace/todo
        // For now, simplicity:
        
        // Delete physical file
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(attachment.getFilePath());
        Files.deleteIfExists(filePath);

        // Delete metadata
        attachmentRepo.delete(attachment);
        log.info("Attachment deleted: {} by user: {}", id, email);
    }

    public Path getFilePath(Attachment attachment) {
        return Paths.get(uploadDir).toAbsolutePath().normalize().resolve(attachment.getFilePath());
    }
}
