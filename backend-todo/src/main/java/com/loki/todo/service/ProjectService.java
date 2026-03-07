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
    private final TodosService todosService;
    private final NotificationService notificationService;
    private final GoalRepository goalRepo;
    private final NotificationRepository notificationRepo;

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
        return createProject(workspaceId, name, description, color, email, null);
    }

    @Transactional
    public Project createProject(Long workspaceId, String name, String description, String color, String email, List<String> memberEmails) {
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
        project.getMembers().add(membership.getUser());
        
        // Add requested members
        if (memberEmails != null && !memberEmails.isEmpty()) {
            for (String memberEmail : memberEmails) {
                userRepo.findByEmail(memberEmail).ifPresent(user -> {
                    // Check if member belongs to workspace
                    if (membershipRepo.findByUserAndWorkspace(user, membership.getWorkspace()).isPresent()) {
                        if (!project.getMembers().contains(user)) {
                            project.getMembers().add(user);
                        }
                    } else {
                        log.warn("User {} is not a member of workspace {}, skipping project addition", memberEmail, workspaceId);
                    }
                });
            }
        }

        project.setCreatedAt(LocalDateTime.now());
        project.setUpdatedAt(LocalDateTime.now());

        Project savedProject = projectRepo.save(project);

        // Create default board
        createDefaultBoard(savedProject, membership.getUser());

        log.info("Project created: {} in workspace: {} by user: {} with {} members", 
            savedProject.getId(), workspaceId, email, project.getMembers().size());
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

        // First, handle all tasks in this project
        // When a project is deleted, we permanently delete its tasks to prevent orphaned items
        // Including tasks that might have been soft-deleted
        List<Todos> projectTasks = todosRepo.findByProjectIdIncludeDeleted(projectId);
        for (Todos todo : projectTasks) {
            todosService.deleteTaskInternal(todo.getId(), true, email, true);
        }

        // Clean up Goals referencing this project
        List<Goal> projectGoals = goalRepo.findByProjectId(projectId);
        for (Goal goal : projectGoals) {
            goal.setProject(null);
            goalRepo.save(goal);
        }

        // Clean up Notifications referencing this project
        List<Notification> projectNotifications = notificationRepo.findByProjectId(projectId);
        for (Notification notification : projectNotifications) {
            notification.setProject(null);
            notificationRepo.save(notification);
        }

        // Clean up AI structures
        todosRepo.clearAIProjectStructureReferences(projectId);

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

    @Transactional
    public Project duplicateProject(Long projectId, String email) {
        Project sourceProject = validateProjectAccess(projectId, email);
        User user = userRepo.findByEmail(email).orElseThrow();

        Project newProject = new Project();
        newProject.setName(sourceProject.getName() + " (Copy)");
        newProject.setDescription(sourceProject.getDescription());
        newProject.setColor(sourceProject.getColor());
        newProject.setWorkspace(sourceProject.getWorkspace());
        newProject.setCreatedBy(user);
        newProject.setCreatedAt(LocalDateTime.now());
        newProject.setUpdatedAt(LocalDateTime.now());

        Project savedProject = projectRepo.save(newProject);
        createDefaultBoard(savedProject, user);
        
        log.info("Project duplicated: {} -> {} by user: {}", projectId, savedProject.getId(), email);
        return savedProject;
    }

    @Transactional
    public Project addMemberToProjectByEmail(Long projectId, String memberEmail, String email) {
        User userToAdd = userRepo.findByEmail(memberEmail)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + memberEmail));
        return addMemberToProject(projectId, userToAdd.getId(), email);
    }

    @Transactional
    public Project addMemberToProject(Long projectId, Long userId, String email) {
        Project project = validateProjectAccess(projectId, email);
        User userToAdd = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is in the workspace
        workspaceRepo.findById(project.getWorkspace().getId())
                .flatMap(w -> membershipRepo.findByUserAndWorkspace(userToAdd, w))
                .orElseThrow(() -> new RuntimeException("User is not a member of this workspace"));

        if (!project.getMembers().contains(userToAdd)) {
            project.getMembers().add(userToAdd);
            project.setUpdatedAt(LocalDateTime.now());
            
            // Send notification
            try {
                User addedBy = userRepo.findByEmail(email).orElse(null);
                notificationService.sendProjectMemberAddedNotification(project, userToAdd, addedBy);
            } catch (Exception e) {
                log.error("Failed to send project member added notification", e);
            }
        }

        return projectRepo.save(project);
    }

    @Transactional
    public Project removeMemberFromProject(Long projectId, Long userId, String email) {
        Project project = validateProjectAccess(projectId, email);
        User userToRemove = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        project.getMembers().remove(userToRemove);
        project.setUpdatedAt(LocalDateTime.now());

        return projectRepo.save(project);
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
        Long boardCount = boardRepo.countByProjectId(project.getId());
        Long taskCount = todosRepo.countByProjectId(project.getId());
        Long completedTasks = todosRepo.countCompletedByProjectId(project.getId());
        Double completionPercentage = taskCount > 0 ? (completedTasks * 100.0 / taskCount) : 0.0;
        
        Map<String, Long> tasksByStatus = new HashMap<>();
        for (Todos.Status status : Todos.Status.values()) {
            tasksByStatus.put(status.name(), todosRepo.countByProjectIdAndStatus(project.getId(), status));
        }

        return ProjectDTO.fromEntity(
                project,
                boardCount,
                taskCount,
                completedTasks,
                completionPercentage,
                tasksByStatus
        );
    }

    public List<ProjectDTO> convertToDTOs(List<Project> projects) {
        return projects.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}