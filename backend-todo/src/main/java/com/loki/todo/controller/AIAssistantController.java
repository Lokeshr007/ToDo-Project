// BACKEND-TODO/SRC/main/java/com/loki/todo/controller/AIAssistantController.java
package com.loki.todo.controller;

import com.loki.todo.dto.AIPlanResponseDTO;
import com.loki.todo.dto.TodoDTO;
import com.loki.todo.model.User;
import com.loki.todo.security.CurrentUser;
import com.loki.todo.service.AIAssistantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AIAssistantController {

    private final AIAssistantService aiAssistantService;

    @PostMapping("/parse-plan")
    public ResponseEntity<?> parseStudyPlan(
            @RequestParam("file") MultipartFile file,
            @CurrentUser User user) {

        log.info("Parsing study plan file: {} for user: {}", file.getOriginalFilename(), user.getEmail());

        try {
            AIPlanResponseDTO response = aiAssistantService.parsePlan(file, user);
            Map<String, Object> result = new HashMap<>();
            result.put("plan", response);
            result.put("success", true);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to parse plan", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/generate-tasks")
    public ResponseEntity<?> generateTasks(
            @RequestBody Map<String, Object> request,
            @CurrentUser User user) {

        log.info("Generating tasks from plan for user: {}", user.getEmail());

        try {
            // Extract plan from request
            Object planObj = request.get("plan");

            List<TodoDTO> tasks = aiAssistantService.generateTasksFromPlan(planObj, user);

            Map<String, Object> result = new HashMap<>();
            result.put("tasks", tasks);
            result.put("success", true);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to generate tasks", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/chat")
    public ResponseEntity<?> chatWithAI(
            @RequestBody Map<String, Object> message,
            @CurrentUser User user) {

        log.info("AI chat with user: {}", user.getEmail());

        try {
            String response = aiAssistantService.processChat(message, user);
            Map<String, Object> result = new HashMap<>();
            result.put("response", response);
            result.put("success", true);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Failed to process chat", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}