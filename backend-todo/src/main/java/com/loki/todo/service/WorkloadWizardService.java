package com.loki.todo.service;

import com.loki.todo.dto.WorkloadAnalysisDTO;
import com.loki.todo.model.Project;
import com.loki.todo.model.Todos;
import com.loki.todo.model.User;
import com.loki.todo.model.Workspace;
import com.loki.todo.repository.ProjectRepository;
import com.loki.todo.repository.TodosRepository;
import com.loki.todo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkloadWizardService {

    private final TodosRepository todoRepo;
    private final ProjectRepository projectRepo;
    private final UserRepository userRepo;

    public WorkloadAnalysisDTO analyzeWorkspace(Long workspaceId) {
        // Fetch only non-deleted todos for this workspace using repository directly
        Workspace workspace = new Workspace();
        workspace.setId(workspaceId);
        
        List<Todos> allTasks = todoRepo.findByWorkspace(workspace).stream()
                .filter(t -> t != null && t.getDeletedAt() == null && t.getStatus() != Todos.Status.ARCHIVED)
                .collect(Collectors.toList());

        // Group by user
        Map<User, List<Todos>> tasksByUser = allTasks.stream()
                .filter(t -> t.getAssignedTo() != null)
                .collect(Collectors.groupingBy(task -> task.getAssignedTo()));

        List<WorkloadAnalysisDTO.UserWorkload> userStats = new ArrayList<>();
        List<WorkloadAnalysisDTO.Bottleneck> bottlenecks = new ArrayList<>();
        List<WorkloadAnalysisDTO.Suggestion> suggestions = new ArrayList<>();

        for (Map.Entry<User, List<Todos>> entry : tasksByUser.entrySet()) {
            User user = entry.getKey();
            List<Todos> tasks = entry.getValue();

            int active = (int) tasks.stream().filter(t -> t.getStatus() != Todos.Status.COMPLETED).count();
            int completed = (int) tasks.stream().filter(t -> t.getStatus() == Todos.Status.COMPLETED).count();
            int overdue = (int) tasks.stream().filter(t -> t.isOverdue() && t.getStatus() != Todos.Status.COMPLETED).count();

            // Utilization: Based on a more realistic 8 parallel tasks limit for high-performing teams
            double utilization = (active / 8.0) * 100.0;

            userStats.add(WorkloadAnalysisDTO.UserWorkload.builder()
                    .userId(user.getId())
                    .userName(user.getName())
                    .activeTasks(active)
                    .completedTasks(completed)
                    .overdueTasks(overdue)
                    .utilizationPercentage(Math.min(utilization, 100.0))
                    .build());

            // Detect bottlenecks
            if (active > 8) {
                bottlenecks.add(WorkloadAnalysisDTO.Bottleneck.builder()
                        .reason(user.getName() + " has critical workload (" + active + " active tasks).")
                        .severity("HIGH")
                        .affectedTaskIds(tasks.stream()
                                .filter(t -> t.getStatus() == Todos.Status.PENDING)
                                .map(Todos::getId)
                                .limit(2)
                                .collect(Collectors.toList()))
                        .build());

                suggestions.add(WorkloadAnalysisDTO.Suggestion.builder()
                        .type("REASSIGN")
                        .description("High risk of burnout for " + user.getName() + ". 3 tasks are suitable for delegation.")
                        .targetTaskId(tasks.stream().filter(t -> t.getStatus() == Todos.Status.PENDING).findFirst().map(Todos::getId).orElse(null))
                        .build());
            }

            if (overdue > 2) {
                bottlenecks.add(WorkloadAnalysisDTO.Bottleneck.builder()
                        .reason(user.getName() + " is falling behind on " + overdue + " deadlines.")
                        .severity("MEDIUM")
                        .affectedTaskIds(tasks.stream()
                                .filter(t -> t.isOverdue() && t.getStatus() != Todos.Status.COMPLETED)
                                .map(Todos::getId)
                                .limit(3)
                                .collect(Collectors.toList()))
                        .build());
            }
        }

        // Overall status counts
        Map<String, Long> statusMap = allTasks.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().name(), Collectors.counting()));

        return WorkloadAnalysisDTO.builder()
                .userWorkloads(userStats)
                .bottlenecks(bottlenecks)
                .suggestions(suggestions)
                .tasksByStatus(statusMap)
                .overallEfficiency(calculateEfficiency(allTasks))
                .build();
    }

    private double calculateEfficiency(List<Todos> tasks) {
        if (tasks.isEmpty()) return 100.0;
        
        long totalActive = tasks.stream().filter(t -> t.getStatus() != Todos.Status.COMPLETED).count();
        if (totalActive == 0) return 100.0;

        long onTime = tasks.stream()
                .filter(t -> t.getStatus() != Todos.Status.COMPLETED && !t.isOverdue())
                .count();
        
        // Efficiency = (Active & On-Time) / All Active
        return (onTime / (double) totalActive) * 100.0;
    }
}
