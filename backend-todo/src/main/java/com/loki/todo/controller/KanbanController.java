// KanbanController.java - Fixed
package com.loki.todo.controller;

import com.loki.todo.dto.*;
import com.loki.todo.service.KanbanService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/kanban")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class KanbanController {

    private final KanbanService kanbanService;

    public KanbanController(KanbanService kanbanService) {
        this.kanbanService = kanbanService;
    }

    @PostMapping("/boards/{boardId}/columns")
    public ResponseEntity<BoardColumnDTO> createColumn(
            @PathVariable Long boardId,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        String name = (String) body.get("name");
        String description = (String) body.get("description");
        String type = (String) body.get("type");
        Integer wipLimit = body.get("wipLimit") != null ? ((Number) body.get("wipLimit")).intValue() : null;
        String color = (String) body.get("color");

        return ResponseEntity.ok(kanbanService.createColumn(
                boardId, name, description, type, wipLimit, color, auth.getName()
        ));
    }

    @PutMapping("/columns/{columnId}")
    public ResponseEntity<BoardColumnDTO> updateColumn(
            @PathVariable Long columnId,
            @RequestBody Map<String, Object> body,
            Authentication auth) {

        String name = (String) body.get("name");
        String description = (String) body.get("description");
        Integer wipLimit = body.get("wipLimit") != null ? ((Number) body.get("wipLimit")).intValue() : null;
        String color = (String) body.get("color");

        return ResponseEntity.ok(kanbanService.updateColumn(
                columnId, name, description, wipLimit, color, auth.getName()
        ));
    }

    @DeleteMapping("/columns/{columnId}")
    public ResponseEntity<Void> deleteColumn(
            @PathVariable Long columnId,
            @RequestParam(required = false) Long moveToColumnId,
            Authentication auth) {

        kanbanService.deleteColumn(columnId, moveToColumnId, auth.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/tasks/move")
    public ResponseEntity<TodoCardDTO> moveTask(
            @RequestBody BoardMoveDTO moveDTO,
            Authentication auth) {

        return ResponseEntity.ok(kanbanService.moveTask(moveDTO, auth.getName()));
    }

    @GetMapping("/boards/{boardId}")
    public ResponseEntity<BoardDetailsDTO> getBoardDetails(
            @PathVariable Long boardId,
            Authentication auth) {

        return ResponseEntity.ok(kanbanService.getBoardDetails(boardId, auth.getName()));
    }

    @PutMapping("/boards/{boardId}/columns/reorder")
    public ResponseEntity<Void> reorderColumns(
            @PathVariable Long boardId,
            @RequestBody List<Long> columnIds,
            Authentication auth) {

        kanbanService.reorderColumns(boardId, columnIds, auth.getName());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/columns/{columnId}/tasks")
    public ResponseEntity<TodoCardDTO> createTaskInColumn(
            @PathVariable Long columnId,
            @RequestBody TodoRequest request,
            Authentication auth) {

        return ResponseEntity.ok(kanbanService.createTaskInColumn(
                columnId, request, auth.getName()
        ));
    }

    @PutMapping("/tasks/{taskId}/assignees")
    public ResponseEntity<TodoCardDTO> updateTaskAssignees(
            @PathVariable Long taskId,
            @RequestBody List<Long> userIds,
            Authentication auth) {

        return ResponseEntity.ok(kanbanService.updateTaskAssignees(
                taskId, userIds, auth.getName()
        ));
    }

    @GetMapping("/boards/{boardId}/activity")
    public ResponseEntity<List<BoardActivityDTO>> getBoardActivity(
            @PathVariable Long boardId,
            @RequestParam(defaultValue = "50") int limit,
            Authentication auth) {

        return ResponseEntity.ok(kanbanService.getBoardActivity(boardId, limit, auth.getName()));
    }
}
