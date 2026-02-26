// com/loki/todo/controller/BoardController.java
package com.loki.todo.controller;

import com.loki.todo.dto.BoardDTO;
import com.loki.todo.model.Board;
import com.loki.todo.service.BoardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/boards")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    @GetMapping
    public ResponseEntity<?> getBoards(
            @RequestParam Long projectId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            log.info("Fetching boards for project: {} by user: {}", projectId, email);

            List<Board> boards = boardService.getBoards(projectId, email);
            List<BoardDTO> boardDTOs = boardService.convertToDTOs(boards);

            return ResponseEntity.ok(boardDTOs);
        } catch (Exception e) {
            log.error("Failed to fetch boards", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{boardId}")
    public ResponseEntity<?> getBoard(
            @PathVariable Long boardId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            log.info("Fetching board: {} by user: {}", boardId, email);

            Board board = boardService.getBoard(boardId, email);
            BoardDTO boardDTO = boardService.convertToDTO(board);

            return ResponseEntity.ok(boardDTO);
        } catch (RuntimeException e) {
            log.error("Board not found: {}", boardId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to fetch board", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createBoard(
            @RequestParam Long projectId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            String name = body.get("name");
            String description = body.get("description");
            String color = body.get("color");

            log.info("Creating board: {} in project: {} by user: {}", name, projectId, email);

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Board name is required"));
            }

            Board board = boardService.createBoard(
                    projectId,
                    name,
                    description,
                    color,
                    email
            );

            BoardDTO boardDTO = boardService.convertToDTO(board);

            return ResponseEntity.status(HttpStatus.CREATED).body(boardDTO);
        } catch (RuntimeException e) {
            log.error("Failed to create board", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to create board", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{boardId}")
    public ResponseEntity<?> updateBoard(
            @PathVariable Long boardId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            String name = body.get("name");
            String description = body.get("description");
            String color = body.get("color");

            log.info("Updating board: {} by user: {}", boardId, email);

            Board board = boardService.updateBoard(
                    boardId,
                    name,
                    description,
                    color,
                    email
            );

            BoardDTO boardDTO = boardService.convertToDTO(board);

            return ResponseEntity.ok(boardDTO);
        } catch (RuntimeException e) {
            log.error("Failed to update board", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to update board", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{boardId}")
    public ResponseEntity<?> deleteBoard(
            @PathVariable Long boardId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            log.info("Deleting board: {} by user: {}", boardId, email);

            boardService.deleteBoard(boardId, email);

            return ResponseEntity.ok(Map.of(
                    "message", "Board deleted successfully",
                    "success", true
            ));
        } catch (RuntimeException e) {
            log.error("Failed to delete board", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to delete board", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{boardId}/duplicate")
    public ResponseEntity<?> duplicateBoard(
            @PathVariable Long boardId,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            log.info("Duplicating board: {} by user: {}", boardId, email);

            Board board = boardService.duplicateBoard(boardId, email);
            BoardDTO boardDTO = boardService.convertToDTO(board);

            return ResponseEntity.status(HttpStatus.CREATED).body(boardDTO);
        } catch (RuntimeException e) {
            log.error("Failed to duplicate board", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to duplicate board", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/reorder")
    public ResponseEntity<?> reorderBoards(
            @RequestBody List<Map<String, Long>> boardOrder,
            Authentication authentication) {

        try {
            String email = authentication.getName();
            log.info("Reordering boards by user: {}", email);

            boardService.reorderBoards(boardOrder, email);

            return ResponseEntity.ok(Map.of(
                    "message", "Boards reordered successfully",
                    "success", true
            ));
        } catch (RuntimeException e) {
            log.error("Failed to reorder boards", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Failed to reorder boards", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}