// com/loki/todo/service/ProjectService.java
package com.loki.todo.service;

import com.loki.todo.dto.ProjectDTO;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepo;
    private final WorkspaceRepository workspaceRepo;
    private final MembershipRepository membershipRepo;
    private final UserRepository userRepo;
    private final BoardRepository boardRepo;
    private final TodosRepository todosRepo;

    private Membership validateWorkspaceAccess(Long workspaceId, String email) {
        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return membershipRepo.findByUserAndWorkspace(user, workspace)
                .orElseThrow(() -> new RuntimeException("You don't have access to this workspace"));
    }

    private Project validateProjectAccess(Long projectId, String email) {
        Project project = projectRepo.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        validateWorkspaceAccess(project.getWorkspace().getId(), email);
        return project;
    }

    @Transactional
    public Project createProject(Long workspaceId, String name, String description, String color, String email) {
        Membership membership = validateWorkspaceAccess(workspaceId, email);

        if (projectRepo.existsByWorkspaceAndName(membership.getWorkspace(), name)) {
            throw new RuntimeException("A project with this name already exists in the workspace");
        }

        Project project = new Project();
        project.setName(name);
        project.setDescription(description != null ? description : "");
        project.setColor(color != null ? color : "#6366f1");
        project.setWorkspace(membership.getWorkspace());
        project.setCreatedBy(membership.getUser());
        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());

        Project savedProject = projectRepo.save(project);

        // Create default board
        createDefaultBoard(savedProject, membership.getUser());

        log.info("Project created: {} in workspace: {} by user: {}", savedProject.getId(), workspaceId, email);
        return savedProject;
    }

    private void createDefaultBoard(Project project, User user) {
        Board board = new Board();
        board.setName("Default Board");
        board.setDescription("Default board for " + project.getName());
        board.setColor("#6366f1");
        board.setProject(project);
        board.setCreatedBy(user);
        board.setOrderIndex(0);
        boardRepo.save(board);

        // Create default columns
        createDefaultColumns(board, user);
    }

    private void createDefaultColumns(Board board, User user) {
        String[] columnNames = {"To Do", "In Progress", "Review", "Done"};
        BoardColumn.ColumnType[] types = {
                BoardColumn.ColumnType.TODO,
                BoardColumn.ColumnType.IN_PROGRESS,
                BoardColumn.ColumnType.REVIEW,
                BoardColumn.ColumnType.DONE
        };
        String[] colors = {"#6b7280", "#3b82f6", "#a855f7", "#22c55e"};

        for (int i = 0; i < columnNames.length; i++) {
            BoardColumn column = new BoardColumn();
            column.setName(columnNames[i]);
            column.setBoard(board);
            column.setOrderIndex(i);
            column.setCreatedBy(user);
            column.setType(types[i]);
            column.setColor(colors[i]);
            board.getColumns().add(column);
        }
    }

    @Transactional
    public Project updateProject(Long projectId, String name, String description, String color, String email) {
        Project project = validateProjectAccess(projectId, email);

        if (name != null && !name.trim().isEmpty() && !name.equals(project.getName())) {
            if (projectRepo.existsByWorkspaceAndName(project.getWorkspace(), name)) {
                throw new RuntimeException("A project with this name already exists in the workspace");
            }
            project.setName(name);
        }

        if (description != null) {
            project.setDescription(description);
        }

        if (color != null) {
            project.setColor(color);
        }

        project.setUpdatedAt(LocalDateTime.now());
        Project updatedProject = projectRepo.save(project);
        log.info("Project updated: {} by user: {}", projectId, email);
        return updatedProject;
    }

    @Transactional
    public void deleteProject(Long projectId, String email) {
        Project project = validateProjectAccess(projectId, email);

        // First, soft delete all tasks in this project
        List<Board> boards = boardRepo.findByProjectIdOrderByOrderIndex(projectId);
        for (Board board : boards) {
            for (Todos todo : board.getTodos()) {
                todo.softDelete();
                todosRepo.save(todo);
            }
        }

        // Then delete the project (this will cascade to boards and columns due to cascade settings)
        projectRepo.delete(project);
        log.info("Project deleted: {} by user: {}", projectId, email);
    }

    public Project getProject(Long projectId, String email) {
        return validateProjectAccess(projectId, email);
    }

    public List<Project> getProjects(Long workspaceId, String email) {
        Membership membership = validateWorkspaceAccess(workspaceId, email);
        return projectRepo.findByWorkspaceOrderByCreatedAtDesc(membership.getWorkspace());
    }

    public long getBoardCount(Long projectId) {
        return boardRepo.countByProjectId(projectId);
    }

    public long getTaskCount(Long projectId) {
        return todosRepo.countByProjectId(projectId);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProjectStats(Long projectId, String email) {
        Project project = validateProjectAccess(projectId, email);

        Map<String, Object> stats = new HashMap<>();

        long boardCount = boardRepo.countByProjectId(projectId);
        stats.put("totalBoards", boardCount);

        long totalTasks = todosRepo.countByProjectId(projectId);
        long completedTasks = todosRepo.countCompletedByProjectId(projectId);
        long pendingTasks = totalTasks - completedTasks;
        long overdueTasks = todosRepo.countOverdueByProjectId(projectId);

        stats.put("totalTasks", totalTasks);
        stats.put("completedTasks", completedTasks);
        stats.put("pendingTasks", pendingTasks);
        stats.put("overdueTasks", overdueTasks);
        stats.put("completionRate", totalTasks > 0 ? (completedTasks * 100.0 / totalTasks) : 0);

        Map<String, Long> byStatus = new HashMap<>();
        for (Todos.Status status : Todos.Status.values()) {
            long count = todosRepo.countByProjectIdAndStatus(projectId, status);
            byStatus.put(status.name(), count);
        }
        stats.put("byStatus", byStatus);

        Map<String, Long> byPriority = new HashMap<>();
        for (Todos.Priority priority : Todos.Priority.values()) {
            long count = todosRepo.countByProjectIdAndPriority(projectId, priority);
            byPriority.put(priority.name(), count);
        }
        stats.put("byPriority", byPriority);

        PageRequest pageable = PageRequest.of(0, 5);
        List<Map<String, Object>> recentTasks = todosRepo.findRecentByProjectId(projectId, pageable);
        stats.put("recentTasks", recentTasks);

        return stats;
    }

    public ProjectDTO convertToDTO(Project project) {
        return ProjectDTO.fromEntity(
                project,
                getBoardCount(project.getId()),
                getTaskCount(project.getId())
        );
    }

    public List<ProjectDTO> convertToDTOs(List<Project> projects) {
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}