package com.loki.todo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
//@RequestMapping("/api/ai/context") // Mapped in EnterpriseAIController
@CrossOrigin(origins = "*", maxAge = 3600)
public class AIContextController {
/*
    @GetMapping("/{sessionId}")
    public ResponseEntity<?> getContext(@PathVariable String sessionId) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> insights = new HashMap<>();
        insights.put("learningStyle", "VISUAL");
        insights.put("attentionSpan", 45);
        response.put("insights", insights);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> createContext(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        Map<String, Object> insights = new HashMap<>();
        insights.put("learningStyle", request.getOrDefault("learningStyle", "VISUAL"));
        response.put("insights", insights);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{sessionId}")
    public ResponseEntity<?> updateContext(@PathVariable String sessionId, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(updates);
    }

    @PostMapping("/{sessionId}/messages")
    public ResponseEntity<?> addMessageToContext(@PathVariable String sessionId, @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(request);
    }

    @GetMapping("/{sessionId}/messages")
    public ResponseEntity<?> getContextMessages(@PathVariable String sessionId) {
        return ResponseEntity.ok(new ArrayList<>());
    }

    @DeleteMapping("/{sessionId}")
    public ResponseEntity<?> clearContext(@PathVariable String sessionId) {
        return ResponseEntity.ok().build();
    }
    */
}
