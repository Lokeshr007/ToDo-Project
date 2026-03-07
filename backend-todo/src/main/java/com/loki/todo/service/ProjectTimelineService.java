package com.loki.todo.service;

import com.loki.todo.dto.TimelineTaskDTO;
import com.loki.todo.model.Project;
import com.loki.todo.model.Todos;
import com.loki.todo.repository.ProjectRepository;
import com.loki.todo.repository.TodosRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectTimelineService {

    private final TodosRepository todosRepository;
    private final ProjectRepository projectRepository;

    public List<TimelineTaskDTO> getProjectTimeline(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Project not found"));

        List<Todos> tasks = todosRepository.findByProjectOrderByDueDateAsc(project);

        return tasks.stream().map(task -> {
            LocalDate startDate = task.getStartedAt() != null ? 
                    task.getStartedAt().toLocalDate() : 
                    (task.getCreatedAt() != null ? task.getCreatedAt().toLocalDate() : LocalDate.now());
            
            LocalDate endDate = task.getDueDate() != null ? 
                    task.getDueDate() : 
                    startDate.plusDays(1); // Default 1 day duration

            // Ensure end date is not before start date
            if (endDate.isBefore(startDate)) {
                endDate = startDate.plusDays(1);
            }

            return TimelineTaskDTO.builder()
                    .id(task.getId())
                    .name(task.getItem())
                    .start(startDate)
                    .end(endDate)
                    .status(task.getStatus().name())
                    .progress(task.getProgress())
                    .priority(task.getPriority().name())
                    .assigneeName(task.getAssignedTo() != null ? task.getAssignedTo().getName() : "Unassigned")
                    .color(getPriorityColor(task.getPriority()))
                    .dependencies(new ArrayList<>()) // Can be expanded later
                    .build();
        }).collect(Collectors.toList());
    }

    private String getPriorityColor(Todos.Priority priority) {
        switch (priority) {
            case HIGH: return "#ef4444"; // Red
            case MEDIUM: return "#f59e0b"; // Amber
            case NORMAL: return "#3b82f6"; // Blue
            case LOW: return "#10b981"; // Emerald
            default: return "#6b7280"; // Gray
        }
    }
}
