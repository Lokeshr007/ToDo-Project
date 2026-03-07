package com.loki.todo.service;

import com.loki.todo.model.TimeTracking;
import com.loki.todo.model.Todos;
import com.loki.todo.model.User;
import com.loki.todo.repository.TimeTrackingRepository;
import com.loki.todo.repository.TodosRepository;
import com.loki.todo.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class TimeTrackingService {

    private final TimeTrackingRepository timeRepo;
    private final TodosRepository todoRepo;
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public TimeTracking getActiveTimer(String email) {
        User user = getUserByEmail(email);
        return timeRepo.findByUserAndEndTimeIsNull(user).orElse(null);
    }

    @Transactional
    public TimeTracking startTimeTracking(Long todoId, String email) {
        User user = getUserByEmail(email);
        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));

        // Check if already tracking - auto-stop existing timer
        Optional<TimeTracking> activeTimer = timeRepo.findByUserAndEndTimeIsNull(user);
        if (activeTimer.isPresent()) {
            stopTimeTracking(activeTimer.get().getId(), email);
        }

        TimeTracking tracking = new TimeTracking();
        tracking.setTodo(todo);
        tracking.setUser(user);
        tracking.setStartTime(LocalDateTime.now());

        log.info("Timer started for task: {} by user: {}", todoId, email);
        return timeRepo.save(tracking);
    }

    @Transactional
    public TimeTracking stopTimeTracking(Long trackingId, String email) {
        TimeTracking tracking = timeRepo.findById(trackingId)
                .orElseThrow(() -> new RuntimeException("Time tracking not found"));

        if (!tracking.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You can only stop your own timers");
        }

        if (tracking.getEndTime() != null) {
            return tracking; // Already stopped
        }

        tracking.stop(); // Uses domain method to set end time and calculate hours
        TimeTracking saved = timeRepo.save(tracking);

        // Update todo's actual hours
        Todos todo = tracking.getTodo();
        if (todo != null && saved.getHoursLogged() != null) {
            todo.addTimeSpent(saved.getHoursLogged());
            todoRepo.save(todo);
        }

        log.info("Timer stopped: {} for task: {} by user: {}", trackingId, todo != null ? todo.getId() : "null", email);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<TimeTracking> getTimeTracking(Long todoId) {
        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        return timeRepo.findByTodo(todo);
    }

    @Transactional(readOnly = true)
    public Double getTotalTimeForTodo(Long todoId) {
        Todos todo = todoRepo.findById(todoId)
                .orElseThrow(() -> new RuntimeException("Todo not found"));
        return timeRepo.totalHoursForTodo(todo);
    }

    @Transactional
    public void deleteByTodo(Todos todo) {
        timeRepo.deleteByTodo(todo);
    }

    private User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}