package com.loki.todo.controller;

import com.loki.todo.dto.TodoRequest;
import com.loki.todo.dto.TodoResponse;
import com.loki.todo.dto.TimeTrackingResponse;
import com.loki.todo.dto.CommentResponse;
import com.loki.todo.model.Comment;
import com.loki.todo.model.TimeTracking;
import com.loki.todo.model.Todos;
import com.loki.todo.service.TodosService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/todos")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class TodosController {

    private final TodosService todosService;

    public TodosController(TodosService todosService) {
        this.todosService = todosService;
    }

    @GetMapping
    public ResponseEntity<?> getTasks(
            @RequestParam(required = false) String filter,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDate,
            @RequestParam(required = false) List<String> labels,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size,
            Authentication authentication) {

        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            List<Todos> tasks = todosService.getFilteredTasks(
                    userEmail, filter, projectId, priority, status,
                    assigneeId, dueDate, labels, page, size
            );

            List<TodoResponse> responses = tasks.stream()
                    .map(TodoResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getTaskStats(Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            Map<String, Object> stats = todosService.getTaskStats(userEmail);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchTasks(
            @RequestParam String q,
            Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            List<Todos> tasks = todosService.searchTasks(q, userEmail);
            List<TodoResponse> responses = tasks.stream()
                    .map(TodoResponse::fromEntity)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTask(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            Todos task = todosService.getTaskById(id, userEmail);
            return ResponseEntity.ok(TodoResponse.fromEntity(task));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> addTask(
            @RequestBody TodoRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            if (request.getItem() == null && request.getTitle() != null) {
                request.setItem(request.getTitle());
            }

            if (request.getItem() == null || request.getItem().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Task title is required"));
            }

            Todos task = todosService.addTask(request, userEmail);
            return ResponseEntity.ok(TodoResponse.fromEntity(task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @RequestBody TodoRequest request,
            Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            if (request.getItem() == null && request.getTitle() != null) {
                request.setItem(request.getTitle());
            }

            Todos task = todosService.updateTask(id, request, userEmail);
            return ResponseEntity.ok(TodoResponse.fromEntity(task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> changeStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            String statusStr = body.get("status");
            if (statusStr == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Status is required"));
            }

            Todos.Status newStatus;
            try {
                newStatus = Todos.Status.valueOf(statusStr.toUpperCase());
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid status value"));
            }

            Todos task = todosService.changeStatus(id, newStatus, userEmail);
            return ResponseEntity.ok(TodoResponse.fromEntity(task));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(
            @PathVariable Long id,
            @RequestParam(defaultValue = "false") boolean permanent,
            Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            todosService.deleteTask(id, permanent, userEmail);

            String message = permanent ? "Task permanently deleted" : "Task archived successfully";
            return ResponseEntity.ok(Map.of(
                    "message", message,
                    "id", id,
                    "permanent", permanent
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/restore")
    public ResponseEntity<?> restoreTask(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            todosService.restoreTask(id, userEmail);

            Todos restored = todosService.getTaskById(id, userEmail);

            return ResponseEntity.ok(Map.of(
                    "message", "Task restored successfully",
                    "task", TodoResponse.fromEntity(restored)
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Assignees
    @PostMapping("/{id}/assignees")
    public ResponseEntity<?> addAssignee(
            @PathVariable Long id,
            @RequestBody Map<String, Long> body,
            Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            Long userId = body.get("userId");
            if (userId == null) return ResponseEntity.badRequest().body(Map.of("error", "userId is required"));

            Todos task = todosService.addAssigneeToTask(id, userId, userEmail);
            return ResponseEntity.ok(TodoResponse.fromEntity(task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/assignees/{userId}")
    public ResponseEntity<?> removeAssignee(
            @PathVariable Long id,
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            Todos task = todosService.removeAssigneeFromTask(id, userId, userEmail);
            return ResponseEntity.ok(TodoResponse.fromEntity(task));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Comments
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable Long id,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            String content = body.get("content");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Comment content is required"));
            }

            Comment comment = todosService.addComment(id, content, userEmail);
            return ResponseEntity.ok(CommentResponse.fromEntity(comment));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<?> getComments(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            List<Comment> comments = todosService.getComments(id, userEmail);
            List<CommentResponse> response = comments.stream()
                .map(CommentResponse::fromEntity)
                .collect(Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Time tracking (active timer & stop are handled by TimeTrackingController at /api/todos/time)
    @PostMapping("/{id}/time/start")
    public ResponseEntity<?> startTimeTracking(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            TimeTracking tracking = todosService.startTimeTracking(id, userEmail);
            return ResponseEntity.ok(TimeTrackingResponse.fromEntity(tracking));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/time")
    public ResponseEntity<?> getTimeTracking(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            List<TimeTracking> tracking = todosService.getTimeTracking(id, userEmail);
            List<TimeTrackingResponse> response = tracking.stream().map(TimeTrackingResponse::fromEntity).collect(java.util.stream.Collectors.toList());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/time/total")
    public ResponseEntity<?> getTotalTime(@PathVariable Long id, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            if (userEmail == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "User not authenticated"));
            }

            Double total = todosService.getTotalTimeForTodo(id, userEmail);
            return ResponseEntity.ok(Map.of("total", total != null ? total : 0));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // Bulk operations
    @PostMapping("/bulk/delete")
    public ResponseEntity<?> bulkDelete(@RequestBody Map<String, Object> body, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            Object idsObj = body.get("ids");
            if (!(idsObj instanceof List)) {
                return ResponseEntity.badRequest().body(Map.of("error", "ids must be a list"));
            }
            
            List<Long> ids = ((List<?>) idsObj).stream()
                    .filter(Objects::nonNull)
                    .map(id -> {
                        try {
                            if (id instanceof Number) return ((Number) id).longValue();
                            String s = String.valueOf(id);
                            return s.contains(".") ? Double.valueOf(s).longValue() : Long.valueOf(s);
                        } catch (Exception e) {
                            log.warn("Invalid ID in bulk delete: {}", id);
                            return null;
                        }
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());
                    
            if (ids.isEmpty()) {
                return ResponseEntity.ok(Map.of("message", "No valid IDs provided", "count", 0));
            }

            boolean permanent = Boolean.TRUE.equals(body.get("permanent"));
            
            todosService.bulkDelete(ids, permanent, userEmail);
            return ResponseEntity.ok(Map.of("message", "Bulk delete successful", "count", ids.size()));
        } catch (Exception e) {
            log.error("Bulk delete failed", e);
            String errorMsg = e.toString() + (e.getCause() != null ? " | Cause: " + e.getCause().toString() : "");
            return ResponseEntity.badRequest().body(Map.of("error", errorMsg));
        }
    }

    @PostMapping("/bulk/status")
    public ResponseEntity<?> bulkStatusUpdate(@RequestBody Map<String, Object> body, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            Object idsObj = body.get("ids");
            if (!(idsObj instanceof List)) {
                return ResponseEntity.badRequest().body(Map.of("error", "ids must be a list"));
            }
            
            List<Long> ids = ((List<?>) idsObj).stream()
                    .map(id -> Long.valueOf(id.toString()))
                    .collect(Collectors.toList());
                    
            String statusStr = (String) body.get("status");
            Todos.Status status = Todos.Status.valueOf(statusStr.toUpperCase());
            
            todosService.bulkUpdateStatus(ids, status, userEmail);
            return ResponseEntity.ok(Map.of("message", "Bulk status update successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/bulk/assign")
    public ResponseEntity<?> bulkAssign(@RequestBody Map<String, Object> body, Authentication authentication) {
        try {
            String userEmail = authentication != null ? authentication.getName() : null;
            Object idsObj = body.get("ids");
            if (!(idsObj instanceof List)) {
                return ResponseEntity.badRequest().body(Map.of("error", "ids must be a list"));
            }
            
            List<Long> ids = ((List<?>) idsObj).stream()
                    .map(id -> Long.valueOf(id.toString()))
                    .collect(Collectors.toList());
                    
            Long userId = Long.valueOf(body.get("userId").toString());
            
            todosService.bulkAssign(ids, userId, userEmail);
            return ResponseEntity.ok(Map.of("message", "Bulk assignment successful"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}