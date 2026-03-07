package com.loki.todo.controller;

import com.loki.todo.model.LearningPath;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai/learning-paths")
@CrossOrigin(origins = "*", maxAge = 3600)
public class LearningPathController {

    @GetMapping
    public ResponseEntity<List<LearningPath>> getLearningPaths(
            @RequestParam(required = false) Long workspaceId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty) {
        
        // Return mock data or empty list to prevent frontend crash
        return ResponseEntity.ok(new ArrayList<>());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LearningPath> getLearningPath(@PathVariable Long id) {
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<LearningPath> createLearningPath(@RequestBody LearningPath path) {
        return ResponseEntity.ok(path);
    }

    @PutMapping("/{id}")
    public ResponseEntity<LearningPath> updateLearningPath(
            @PathVariable Long id, 
            @RequestBody LearningPath path) {
        return ResponseEntity.ok(path);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLearningPath(@PathVariable Long id) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/clone")
    public ResponseEntity<LearningPath> cloneLearningPath(@PathVariable Long id) {
        return ResponseEntity.ok(new LearningPath());
    }

    @PostMapping("/{id}/rate")
    public ResponseEntity<?> rateLearningPath(
            @PathVariable Long id, 
            @RequestBody Map<String, Integer> ratingData) {
        return ResponseEntity.ok().build();
    }

    @PostMapping("/generate")
    public ResponseEntity<LearningPath> generateLearningPath(
            @RequestBody Map<String, Object> request) {
        return ResponseEntity.ok(new LearningPath());
    }
}
