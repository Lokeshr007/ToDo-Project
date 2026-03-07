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
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class EnterpriseAIController {

    private final EnterpriseAIService enterpriseAIService;

    @PostMapping({"/parse-plan", "/enterprise/parse-plan", "/enterprise/process-file"})
    public ResponseEntity<?> parsePlan(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "request", required = false) String requestJson,
            @RequestParam(value = "workspaceId", required = false) Long workspaceId,
            @RequestParam(value = "createProject", required = false) Boolean createProject,
            @CurrentUser User user) {

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
        try {
            EnterpriseAIRequestDTO request;
            if (requestJson != null && !requestJson.isEmpty()) {
                request = parseRequest(requestJson);
            } else {
                request = new EnterpriseAIRequestDTO();
            }
            request.setFile(file);
            request.setAction("PARSE_PLAN");
            if (workspaceId != null) request.setWorkspaceId(workspaceId);
            if (createProject != null) request.setCreateProject(createProject);
            
            log.info("Parsing plan for user: {} (Create project: {})", user.getEmail(), request.getCreateProject());

            EnterpriseAIResponseDTO response = enterpriseAIService.processRequest(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to parse plan file", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping({"/generate-tasks", "/enterprise/generate-tasks"})
    public ResponseEntity<?> generateTasks(
            @RequestBody EnterpriseAIRequestDTO request,
            @CurrentUser User user) {

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
        log.info("Generating tasks for plan: {} for user: {}", request.getPlanId(), user.getEmail());

        try {
            request.setAction("GENERATE_TASKS");
            EnterpriseAIResponseDTO response = enterpriseAIService.processRequest(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to generate tasks", e);
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @PostMapping({"/chat", "/enterprise/chat", "/enterprise/process", "/enterprise/process-natural-language"})
    public ResponseEntity<?> chat(
            @RequestBody EnterpriseAIRequestDTO request,
            @CurrentUser User user) {

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Message is required"));
        }

        try {
            request.setAction("CHAT");
            EnterpriseAIResponseDTO response = enterpriseAIService.processRequest(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to process AI chat", e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/process")
    public ResponseEntity<?> processRequest(
            @RequestBody EnterpriseAIRequestDTO request,
            @CurrentUser User user) {

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
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

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
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

    @PostMapping({"/accept-tasks", "/enterprise/accept-tasks"})
    public ResponseEntity<?> acceptTasks(
            @RequestBody EnterpriseAIRequestDTO request,
            @CurrentUser User user) {
        
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
        
        try {
            request.setAction("ACCEPT_TASKS");
            EnterpriseAIResponseDTO response = enterpriseAIService.processRequest(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to accept tasks", e);
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

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
        log.info("Processing natural language request for user: {}", user.getEmail());

        String message = (String) requestBody.get("message");
        if (message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Message is required"));
        }

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

    @PostMapping({"/plan/{planId}/refine", "/enterprise/plan/{planId}/refine"})
    public ResponseEntity<?> refinePlan(
            @PathVariable Long planId,
            @RequestBody Map<String, String> requestBody,
            @CurrentUser User user) {

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
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

    @GetMapping({"/context/{sessionId}", "/enterprise/context/{sessionId}"})
    public ResponseEntity<?> getContext(
            @PathVariable String sessionId,
            @CurrentUser User user) {

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
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

    @DeleteMapping({"/context/{sessionId}", "/enterprise/context/{sessionId}"})
    public ResponseEntity<?> clearContext(
            @PathVariable String sessionId,
            @CurrentUser User user) {

        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
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

    @PostMapping("/context")
    public ResponseEntity<?> createContext(
            @RequestBody Map<String, Object> request,
            @CurrentUser User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
        try {
            EnterpriseAIResponseDTO response = enterpriseAIService.createContext(request, user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to create context", e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/context/{sessionId}")
    public ResponseEntity<?> updateContext(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> updates,
            @CurrentUser User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
        try {
            enterpriseAIService.updateContext(sessionId, updates, user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Context updated"));
        } catch (Exception e) {
            log.error("Failed to update context", e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/context/{sessionId}/messages")
    public ResponseEntity<?> addMessageToContext(
            @PathVariable String sessionId,
            @RequestBody Map<String, Object> request,
            @CurrentUser User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
        try {
            String role = (String) request.get("role");
            String content = (String) request.get("content");
            Map<String, Object> metadata = (Map<String, Object>) request.get("metadata");
            
            enterpriseAIService.addMessageToContext(sessionId, role, content, metadata, user);
            return ResponseEntity.ok(Map.of("success", true, "message", "Message added"));
        } catch (Exception e) {
            log.error("Failed to add message", e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/context/{sessionId}/messages")
    public ResponseEntity<?> getContextMessages(
            @PathVariable String sessionId,
            @CurrentUser User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
        try {
            return ResponseEntity.ok(enterpriseAIService.getContextMessages(sessionId, user));
        } catch (Exception e) {
            log.error("Failed to get messages", e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/workload-analysis")
    public ResponseEntity<?> getWorkloadAnalysis(
            @RequestParam Long workspaceId,
            @CurrentUser User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "User not authenticated"));
        }
        try {
            return ResponseEntity.ok(enterpriseAIService.analyzeWorkload(workspaceId, user));
        } catch (Exception e) {
            log.error("Failed to analyze workload", e);
            return ResponseEntity.status(500).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    private EnterpriseAIRequestDTO parseRequest(String requestJson) throws Exception {
        com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
        return mapper.readValue(requestJson, EnterpriseAIRequestDTO.class);
    }
}