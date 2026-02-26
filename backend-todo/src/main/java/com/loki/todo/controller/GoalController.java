package com.loki.todo.controller;

import com.loki.todo.dto.GoalDTO;
import com.loki.todo.dto.GoalProgressDTO;
import com.loki.todo.model.User;
import com.loki.todo.security.CurrentUser;
import com.loki.todo.service.GoalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/goals")
@RequiredArgsConstructor
public class GoalController {

    private final GoalService goalService;

    @PostMapping
    public ResponseEntity<GoalDTO> createGoal(@RequestBody GoalDTO goalDTO, @CurrentUser User user) {
        return ResponseEntity.ok(goalService.createGoal(goalDTO, user));
    }

    @GetMapping
    public ResponseEntity<List<GoalDTO>> getGoals(@CurrentUser User user) {
        return ResponseEntity.ok(goalService.getUserGoals(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GoalDTO> getGoal(@PathVariable Long id, @CurrentUser User user) {
        return ResponseEntity.ok(goalService.getGoal(id, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GoalDTO> updateGoal(@PathVariable Long id, @RequestBody GoalDTO goalDTO, @CurrentUser User user) {
        return ResponseEntity.ok(goalService.updateGoal(id, goalDTO, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id, @CurrentUser User user) {
        goalService.deleteGoal(id, user);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/progress")
    public ResponseEntity<GoalProgressDTO> getGoalProgress(@PathVariable Long id, @CurrentUser User user) {
        return ResponseEntity.ok(goalService.getGoalProgress(id, user));
    }

    @GetMapping("/progress")
    public ResponseEntity<List<GoalProgressDTO>> getAllGoalsProgress(@CurrentUser User user) {
        return ResponseEntity.ok(goalService.getAllGoalsProgress(user));
    }
}