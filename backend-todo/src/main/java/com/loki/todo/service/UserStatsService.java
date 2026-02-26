package com.loki.todo.service;

import com.loki.todo.dto.UserStatsDTO;
import com.loki.todo.exception.ResourceNotFoundException;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserStatsService {

    private final TodosRepository todosRepository;
    private final ProjectRepository projectRepository;
    private final BoardRepository boardRepository;
    private final TimeBlockRepository timeBlockRepository;
    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;

    public UserStatsDTO getUserStats(Long userId) {
        log.info("Getting stats for user ID: {}", userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        log.info("Found user: {}", user.getEmail());

        // Get all todos for user - use ID-based query
        List<Todos> userTodos = todosRepository.findByAssignedToId(userId);
        log.info("Found {} todos", userTodos.size());

        // Calculate basic stats
        long totalTasks = userTodos.size();
        long completedTasks = userTodos.stream()
                .filter(t -> t.getStatus() == Todos.Status.COMPLETED)
                .count();
        long pendingTasks = userTodos.stream()
                .filter(t -> t.getStatus() != Todos.Status.COMPLETED)
                .count();

        // Calculate overdue tasks
        LocalDateTime now = LocalDateTime.now();
        long overdueTasks = userTodos.stream()
                .filter(t -> t.getStatus() != Todos.Status.COMPLETED
                        && t.getDueDate() != null
                        && t.getDueDate().atStartOfDay().isBefore(now))
                .count();

        // Calculate completion rate
        double completionRate = totalTasks > 0 ?
                (double) completedTasks / totalTasks * 100 : 0;

        // Get projects created by user - use ID-based query
        List<Project> userProjects = projectRepository.findByCreatedById(userId);
        long projectsCreated = userProjects.size();

        long totalBoards = userProjects.stream()
                .mapToLong(p -> boardRepository.countByProjectId(p.getId()))
                .sum();

        // Calculate days active
        List<Activity> activities = activityRepository.findByUserIdOrderByTimestampDesc(userId);
        long daysActive = activities.stream()
                .map(a -> a.getTimestamp().toLocalDate())
                .distinct()
                .count();

        // Calculate current streak
        long currentStreak = calculateCurrentStreak(activities);

        // Calculate focus time (from time blocks)
        long focusTime = calculateFocusTime(userId);

        // Calculate average tasks per day
        double averageTasksPerDay = calculateAverageTasksPerDay(activities, userTodos);

        // Find best productive day
        String bestProductiveDay = findBestProductiveDay(activities);

        // Calculate productivity score
        long productivityScore = calculateProductivityScore(completedTasks, pendingTasks, overdueTasks, focusTime);

        return UserStatsDTO.builder()
                .tasksCompleted(completedTasks)
                .projectsCreated(projectsCreated)
                .daysActive(daysActive)
                .currentStreak(currentStreak)
                .totalTasks(totalTasks)
                .pendingTasks(pendingTasks)
                .overdueTasks(overdueTasks)
                .completionRate(completionRate)
                .totalProjects(projectsCreated)
                .totalBoards(totalBoards)
                .totalTimeSpent(focusTime)
                .averageTasksPerDay((long) averageTasksPerDay)
                .bestProductiveDay(bestProductiveDay)
                .focusTime(focusTime)
                .productivityScore(productivityScore)
                .build();
    }

    private long calculateCurrentStreak(List<Activity> activities) {
        if (activities == null || activities.isEmpty()) return 0;

        List<LocalDate> activityDates = activities.stream()
                .map(a -> a.getTimestamp().toLocalDate())
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        LocalDate today = LocalDate.now();
        long streak = 0;

        for (int i = activityDates.size() - 1; i >= 0; i--) {
            LocalDate date = activityDates.get(i);
            if (date.equals(today.minusDays(streak))) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    private long calculateFocusTime(Long userId) {
        LocalDate today = LocalDate.now();
        LocalDate weekAgo = today.minusDays(7);

        List<TimeBlock> timeBlocks = timeBlockRepository.findByUserIdAndDateBetween(
                userId, weekAgo, today);

        return timeBlocks.stream()
                .filter(TimeBlock::getCompleted)
                .mapToLong(block -> ChronoUnit.MINUTES.between(
                        block.getStartTime(), block.getEndTime()))
                .sum();
    }

    private double calculateAverageTasksPerDay(List<Activity> activities, List<Todos> todos) {
        if (activities.isEmpty()) return 0;

        long completedTasks = todos.stream()
                .filter(t -> t.getStatus() == Todos.Status.COMPLETED)
                .count();

        long uniqueDays = activities.stream()
                .map(a -> a.getTimestamp().toLocalDate())
                .distinct()
                .count();

        return uniqueDays > 0 ? (double) completedTasks / uniqueDays : 0;
    }

    private String findBestProductiveDay(List<Activity> activities) {
        Map<String, Long> dayCount = new HashMap<>();
        String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};

        for (String day : days) {
            dayCount.put(day, 0L);
        }

        activities.stream()
                .map(a -> a.getTimestamp().getDayOfWeek().toString())
                .map(day -> {
                    switch(day) {
                        case "MONDAY": return "Monday";
                        case "TUESDAY": return "Tuesday";
                        case "WEDNESDAY": return "Wednesday";
                        case "THURSDAY": return "Thursday";
                        case "FRIDAY": return "Friday";
                        case "SATURDAY": return "Saturday";
                        case "SUNDAY": return "Sunday";
                        default: return "Monday";
                    }
                })
                .forEach(day -> dayCount.put(day, dayCount.get(day) + 1));

        return dayCount.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Monday");
    }

    private long calculateProductivityScore(long completed, long pending, long overdue, long focusTime) {
        double baseScore = completed > 0 ?
                Math.min(100, (completed * 100.0) / (completed + pending)) : 50;

        double overduePenalty = overdue * 5;
        double focusBonus = Math.min(20, focusTime / 60); // 1 point per hour of focus, max 20

        long score = Math.round(Math.max(0, baseScore - overduePenalty + focusBonus));
        return Math.min(100, score);
    }
}