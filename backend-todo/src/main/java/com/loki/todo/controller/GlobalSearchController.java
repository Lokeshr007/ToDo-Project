package com.loki.todo.controller;

import com.loki.todo.dto.GlobalSearchResponse;
import com.loki.todo.model.Board;
import com.loki.todo.model.Project;
import com.loki.todo.model.Todos;
import com.loki.todo.model.Workspace;
import com.loki.todo.repository.BoardRepository;
import com.loki.todo.repository.ProjectRepository;
import com.loki.todo.repository.TodosRepository;
import com.loki.todo.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
@RequiredArgsConstructor
public class GlobalSearchController {

    private final TodosRepository todoRepo;
    private final ProjectRepository projectRepo;
    private final BoardRepository boardRepo;
    private final WorkspaceRepository workspaceRepo;

    @GetMapping
    public ResponseEntity<List<GlobalSearchResponse.SearchResult>> globalSearch(
            @RequestParam String q,
            @RequestParam(required = false) Long workspaceId,
            Authentication authentication) {

        try {
            List<GlobalSearchResponse.SearchResult> results = new ArrayList<>();
            String query = q.toLowerCase();
            String userEmail = authentication != null ? authentication.getName() : null;

            if (userEmail == null) return ResponseEntity.status(401).build();

            // 1. Search Tasks
            List<Todos> tasks = new ArrayList<>();
            if (workspaceId != null) {
                workspaceRepo.findById(workspaceId).ifPresent(workspace -> {
                    tasks.addAll(todoRepo.searchInWorkspace(workspace, q));
                });
            }

            results.addAll(tasks.stream()
                .filter(task -> task != null && task.getWorkspace() != null && task.getItem() != null)
                .map(task -> 
                GlobalSearchResponse.SearchResult.builder()
                    .id(task.getId().toString())
                    .type("task")
                    .title(task.getItem())
                    .description(task.getDescription())
                    .status(task.getStatus() != null ? task.getStatus().name() : "PENDING")
                    .priority(task.getPriority() != null ? task.getPriority().name() : "NORMAL")
                    .workspace(GlobalSearchResponse.WorkspaceInfo.builder()
                        .id(task.getWorkspace().getId())
                        .name(task.getWorkspace().getName())
                        .build())
                    .build()
            ).collect(Collectors.toList()));

            // 2. Search Projects
            List<Project> projects = new ArrayList<>();
            if (workspaceId != null) {
                workspaceRepo.findById(workspaceId).ifPresent(workspace -> {
                    List<Project> wsProjects = projectRepo.findByWorkspace(workspace);
                    if (wsProjects != null) {
                        projects.addAll(wsProjects.stream()
                            .filter(p -> p != null && p.getName() != null && p.getName().toLowerCase().contains(query))
                            .collect(Collectors.toList()));
                    }
                });
            }

            results.addAll(projects.stream()
                .filter(project -> project != null && project.getWorkspace() != null)
                .map(project -> 
                GlobalSearchResponse.SearchResult.builder()
                    .id(project.getId().toString())
                    .type("project")
                    .title(project.getName())
                    .description(project.getDescription())
                    .color(project.getColor())
                    .workspace(GlobalSearchResponse.WorkspaceInfo.builder()
                        .id(project.getWorkspace().getId())
                        .name(project.getWorkspace().getName())
                        .build())
                    .build()
            ).collect(Collectors.toList()));

            // 3. Search Boards (via projects in workspace)
            for (Project project : projects) {
                if (project == null || project.getId() == null) continue;
                List<Board> boards = boardRepo.findByProjectIdOrderByOrderIndex(project.getId());
                if (boards != null) {
                    List<Board> matchingBoards = boards.stream()
                            .filter(b -> b != null && b.getName() != null && b.getName().toLowerCase().contains(query))
                            .collect(Collectors.toList());
                    
                    results.addAll(matchingBoards.stream().map(board -> 
                        GlobalSearchResponse.SearchResult.builder()
                            .id(board.getId().toString())
                            .type("board")
                            .title(board.getName())
                            .workspace(GlobalSearchResponse.WorkspaceInfo.builder()
                                .id(project.getWorkspace().getId())
                                .name(project.getWorkspace().getName())
                                .build())
                            .build()
                    ).collect(Collectors.toList()));
                }
            }

            return ResponseEntity.ok(results);
        } catch (Exception e) {
            log.error("Global search failed for query: {}", q, e);
            return ResponseEntity.status(500).build();
        }
    }
}
