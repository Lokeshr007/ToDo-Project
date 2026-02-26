package com.loki.todo.repository;

import com.loki.todo.model.Reminder;
import com.loki.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {

    List<Reminder> findByUserAndCompletedFalseOrderByScheduledForAsc(User user);

    @Query("SELECT r FROM Reminder r WHERE r.user = :user AND r.completed = false " +
            "AND r.scheduledFor BETWEEN :now AND :future ORDER BY r.scheduledFor")
    List<Reminder> findUpcomingReminders(
            @Param("user") User user,
            @Param("now") LocalDateTime now,
            @Param("future") LocalDateTime future);

    // FIXED: Changed to query for all users when user is null
    @Query("SELECT r FROM Reminder r WHERE (:user IS NULL OR r.user = :user) " +
            "AND r.completed = false AND r.triggered = false AND r.scheduledFor <= :now")
    List<Reminder> findDueReminders(@Param("user") User user, @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(r) FROM Reminder r WHERE r.user = :user AND r.completed = false " +
            "AND r.scheduledFor BETWEEN :start AND :end")
    long countRemindersInRange(
            @Param("user") User user,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}