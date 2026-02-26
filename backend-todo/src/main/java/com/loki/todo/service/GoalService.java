package com.loki.todo.service;

import com.loki.todo.dto.GoalDTO;
import com.loki.todo.dto.GoalProgressDTO;
import com.loki.todo.exception.ResourceNotFoundException;
import com.loki.todo.model.Goal;
import com.loki.todo.model.User;
import com.loki.todo.model.Workspace;
import com.loki.todo.repository.GoalRepository;
import com.loki.todo.repository.TodosRepository;
import com.loki.todo.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final TodosRepository todosRepository;
    private final WorkspaceRepository workspaceRepository;

    @Transactional
    public GoalDTO createGoal(GoalDTO goalDTO, User user) {
        Goal goal = new Goal();
        mapDtoToEntity(goalDTO, goal);
        goal.setUser(user);

        if (goalDTO.getWorkspaceId() != null) {
            Workspace workspace = workspaceRepository.findById(goalDTO.getWorkspaceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace not found"));
            goal.setWorkspace(workspace);
        }

        Goal savedGoal = goalRepository.save(goal);
        return mapEntityToDto(savedGoal);
    }

    public List<GoalDTO> getUserGoals(User user) {
        return goalRepository.findByUser(user).stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    public GoalDTO getGoal(Long id, User user) {
        Goal goal = findGoalByIdAndUser(id, user);
        return mapEntityToDto(goal);
    }

    @Transactional
    public GoalDTO updateGoal(Long id, GoalDTO goalDTO, User user) {
        Goal goal = findGoalByIdAndUser(id, user);
        mapDtoToEntity(goalDTO, goal);
        Goal updatedGoal = goalRepository.save(goal);
        return mapEntityToDto(updatedGoal);
    }

    @Transactional
    public void deleteGoal(Long id, User user) {
        Goal goal = findGoalByIdAndUser(id, user);
        goalRepository.delete(goal);
    }

    public GoalProgressDTO getGoalProgress(Long id, User user) {
        Goal goal = findGoalByIdAndUser(id, user);
        return calculateProgress(goal);
    }

    public List<GoalProgressDTO> getAllGoalsProgress(User user) {
        List<Goal> goals = goalRepository.findByUser(user);
        return goals.stream()
                .map(this::calculateProgress)
                .collect(Collectors.toList());
    }

    @Transactional
    public void updateGoalProgress(Long id, Integer progress, List<LocalDate> completedDates) {
        Goal goal = goalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));

        goal.setProgress(progress);
        if (completedDates != null) {
            goal.setCompletedDates(completedDates);
        }

        goalRepository.save(goal);
    }

    private Goal findGoalByIdAndUser(Long id, User user) {
        return goalRepository.findById(id)
                .filter(goal -> goal.getUser().equals(user))
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
    }

    private GoalProgressDTO calculateProgress(Goal goal) {
        GoalProgressDTO progress = new GoalProgressDTO();
        progress.setGoalId(goal.getId());
        progress.setTitle(goal.getTitle());
        progress.setTarget(goal.getTarget());

        // Calculate current progress based on type
        int current = 0;
        if (goal.getType().equals("daily")) {
            LocalDate today = LocalDate.now();
            current = goal.getCompletedDates().contains(today) ? 1 : 0;
        } else {
            current = goal.getCompletedDates().size();
        }

        progress.setCurrent(current);
        progress.setProgress(goal.getProgress());
        progress.setRemaining(goal.getTarget() - current);
        progress.setCompletedDates(goal.getCompletedDates().stream()
                .map(LocalDate::toString)
                .collect(Collectors.toList()));

        // Calculate status
        LocalDate now = LocalDate.now();
        if (goal.getProgress() >= 100) {
            progress.setStatus("COMPLETED");
        } else if (now.isAfter(goal.getEndDate())) {
            progress.setStatus("OVERDUE");
        } else {
            double timeElapsed = ChronoUnit.DAYS.between(goal.getStartDate(), now);
            double totalDuration = ChronoUnit.DAYS.between(goal.getStartDate(), goal.getEndDate());
            double expectedProgress = (timeElapsed / totalDuration) * 100;

            if (goal.getProgress() >= expectedProgress) {
                progress.setStatus("ON_TRACK");
            } else {
                progress.setStatus("BEHIND");
            }
        }

        progress.setDaysRemaining((int) ChronoUnit.DAYS.between(now, goal.getEndDate()));

        // Projected completion
        if (goal.getProgress() > 0 && !progress.getStatus().equals("COMPLETED")) {
            double ratePerDay = (double) goal.getProgress() /
                    ChronoUnit.DAYS.between(goal.getStartDate(), now);
            int remainingProgress = 100 - goal.getProgress();
            int daysNeeded = (int) Math.ceil(remainingProgress / ratePerDay);
            progress.setProjectedCompletion(ratePerDay * 100);
        }

        return progress;
    }

    private void mapDtoToEntity(GoalDTO dto, Goal entity) {
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setType(dto.getType());
        entity.setTarget(dto.getTarget());
        entity.setUnit(dto.getUnit());
        entity.setStartDate(dto.getStartDate());
        entity.setEndDate(dto.getEndDate());
        entity.setProgress(dto.getProgress() != null ? dto.getProgress() : 0);
        entity.setCompletedDates(dto.getCompletedDates() != null ? dto.getCompletedDates() : List.of());
        entity.setLinkedTasks(dto.getLinkedTasks() != null ? dto.getLinkedTasks() : List.of());
        entity.setPriority(dto.getPriority());
        entity.setColor(dto.getColor());
        entity.setReminder(dto.getReminder());
        entity.setReminderTime(dto.getReminderTime());
    }

    private GoalDTO mapEntityToDto(Goal entity) {
        GoalDTO dto = new GoalDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setType(entity.getType());
        dto.setTarget(entity.getTarget());
        dto.setUnit(entity.getUnit());
        dto.setStartDate(entity.getStartDate());
        dto.setEndDate(entity.getEndDate());
        dto.setProgress(entity.getProgress());
        dto.setCompletedDates(entity.getCompletedDates());
        dto.setLinkedTasks(entity.getLinkedTasks());
        dto.setPriority(entity.getPriority());
        dto.setColor(entity.getColor());
        dto.setReminder(entity.getReminder());
        dto.setReminderTime(entity.getReminderTime());
        dto.setUserId(entity.getUser().getId());
        if (entity.getWorkspace() != null) {
            dto.setWorkspaceId(entity.getWorkspace().getId());
        }
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        return dto;
    }
}