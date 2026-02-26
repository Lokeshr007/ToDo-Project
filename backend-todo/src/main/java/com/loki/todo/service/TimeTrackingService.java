// com/loki/todo/service/TimeTrackingService.java
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
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<TimeTracking> activeTimer = timeRepo.findByUserAndEndTimeIsNull(user);
        return activeTimer.orElse(null);
    }

    @Transactional
    public TimeTracking stopTimeTracking(Long trackingId, String email) {
        TimeTracking tracking = timeRepo.findById(trackingId)
                .orElseThrow(() -> new RuntimeException("Time tracking not found"));

        if (!tracking.getUser().getEmail().equals(email)) {
            throw new RuntimeException("You can only stop your own timers");
        }

        tracking.setEndTime(LocalDateTime.now());
        tracking.setDuration(java.time.Duration.between(tracking.getStartTime(), tracking.getEndTime()).toMinutes());

        TimeTracking saved = timeRepo.save(tracking);

        // Update todo's actual hours
        Todos todo = tracking.getTodo();
        if (todo != null) {
            Double totalHours = timeRepo.totalHoursForTodo(todo);
            if (totalHours != null) {
                todo.setActualHours(totalHours.intValue());
                todoRepo.save(todo);
            }
        }

        log.info("Timer stopped: {} by user: {}", trackingId, email);
        return saved;
    }
}