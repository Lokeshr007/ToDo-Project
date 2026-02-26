// D:\AllProjects\ToDoProject\backend-todo\src\main\java\com\loki\todo\controller\EnterpriseAIController.java
package com.loki.todo.controller;

import com.loki.todo.dto.EnterpriseAIRequestDTO;
import com.loki.todo.dto.EnterpriseAIResponseDTO;
import com.loki.todo.model.User;
import com.loki.todo.security.CurrentUser;
import com.loki.todo.service.EnterpriseAIService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ai/enterprise")
@RequiredArgsConstructor
public class EnterpriseAIController {

    private final EnterpriseAIService enterpriseAIService;

    @PostMapping("/process")
    public ResponseEntity<?> processRequest(
            @RequestBody EnterpriseAIRequestDTO request,
            @CurrentUser User user) {

        log.info("Processing enterprise AI request: {} for user: {}", request.getAction(), user.getEmail());

        try {
            EnterpriseAIResponseDTO response = enterpriseAIService.processRequest(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to process enterprise AI request", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/process-file")
    public ResponseEntity<?> processFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("request") String requestJson,
            @CurrentUser User user) {

        log.info("Processing file: {} for user: {}", file.getOriginalFilename(), user.getEmail());

        try {
            // Parse request JSON
            EnterpriseAIRequestDTO request = parseRequest(requestJson);
            request.setFile(file);
            request.setAction("PARSE_PLAN");

            EnterpriseAIResponseDTO response = enterpriseAIService.processRequest(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to process file", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/process-natural-language")
    public ResponseEntity<?> processNaturalLanguage(
            @RequestBody Map<String, Object> requestBody,
            @CurrentUser User user) {

        log.info("Processing natural language request for user: {}", user.getEmail());

        try {
            EnterpriseAIRequestDTO request = new EnterpriseAIRequestDTO();
            request.setAction("CHAT");
            request.setMessage((String) requestBody.get("message"));
            request.setSessionId((String) requestBody.get("sessionId"));
            request.setWorkspaceId(requestBody.get("workspaceId") != null ?
                    Long.parseLong(requestBody.get("workspaceId").toString()) : null);
            request.setContext((Map<String, Object>) requestBody.get("context"));

            EnterpriseAIResponseDTO response = enterpriseAIService.processRequest(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to process natural language", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping("/plan/{planId}/refine")
    public ResponseEntity<?> refinePlan(
            @PathVariable Long planId,
            @RequestBody Map<String, String> requestBody,
            @CurrentUser User user) {

        log.info("Refining plan: {} for user: {}", planId, user.getEmail());

        try {
            EnterpriseAIRequestDTO request = new EnterpriseAIRequestDTO();
            request.setAction("REFINE");
            request.setPlanId(planId);
            request.setMessage(requestBody.get("instructions"));
            request.setSessionId(requestBody.get("sessionId"));

            EnterpriseAIResponseDTO response = enterpriseAIService.processRequest(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to refine plan", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/context/{sessionId}")
    public ResponseEntity<?> getContext(
            @PathVariable String sessionId,
            @CurrentUser User user) {

        log.info("Getting context: {} for user: {}", sessionId, user.getEmail());

        try {
            EnterpriseAIResponseDTO response = enterpriseAIService.getContext(sessionId, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to get context", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        }
    }

    @DeleteMapping("/context/{sessionId}")
    public ResponseEntity<?> clearContext(
            @PathVariable String sessionId,
            @CurrentUser User user) {

        log.info("Clearing context: {} for user: {}", sessionId, user.getEmail());

        try {
            enterpriseAIService.clearContext(sessionId, user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Context cleared"));
        } catch (Exception e) {
            log.error("Failed to clear context", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    private EnterpriseAIRequestDTO parseRequest(String requestJson) throws Exception {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.readValue(requestJson, EnterpriseAIRequestDTO.class);
    }
}