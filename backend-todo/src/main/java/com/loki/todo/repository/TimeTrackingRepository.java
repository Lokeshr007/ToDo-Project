package com.loki.todo.repository;

import com.loki.todo.model.TimeTracking;
import com.loki.todo.model.Todos;
import com.loki.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface TimeTrackingRepository extends JpaRepository<TimeTracking, Long> {

    List<TimeTracking> findByUserAndStartTimeBetween(User user, LocalDateTime start, LocalDateTime end);

    @Query("SELECT t FROM TimeTracking t WHERE t.user = :user AND t.endTime IS NULL")
    Optional<TimeTracking> findActiveTrackingForUser(@Param("user") User user);

    @Query("SELECT t FROM TimeTracking t JOIN FETCH t.todo WHERE t.user = :user AND t.endTime IS NULL")
    Optional<TimeTracking> findActiveWithTodo(@Param("user") User user);

    @Query("SELECT SUM(t.hoursLogged) FROM TimeTracking t WHERE t.user = :user AND t.startTime >= :start")
    Double totalHoursByUserSince(@Param("user") User user, @Param("start") LocalDateTime start);



    List<TimeTracking> findByUser(User user);

    @Query("SELECT t FROM TimeTracking t WHERE t.todo.id = :todoId AND t.endTime IS NULL")
    List<TimeTracking> findActiveByTodoId(@Param("todoId") Long todoId);

    @Query("SELECT t FROM TimeTracking t WHERE t.user.id = :userId AND t.endTime IS NULL")
    List<TimeTracking> findActiveByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(t.duration) FROM TimeTracking t WHERE t.user.id = :userId")
    Long sumDurationByUserId(@Param("userId") Long userId);

    @Query("SELECT SUM(t.duration) FROM TimeTracking t WHERE t.todo.id = :todoId")
    Long sumDurationByTodoId(@Param("todoId") Long todoId);

    @Query("SELECT t FROM TimeTracking t WHERE t.user.id = :userId ORDER BY t.createdAt DESC")
    List<TimeTracking> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    List<TimeTracking> findByTodo(Todos todo);

    @Query("SELECT COALESCE(SUM(t.hoursLogged), 0) FROM TimeTracking t WHERE t.todo = :todo")
    Double totalHoursForTodo(@Param("todo") Todos todo);

    @Query("SELECT t FROM TimeTracking t WHERE t.user = :user ORDER BY t.startTime DESC")
    List<TimeTracking> findByUserOrderByStartTimeDesc(@Param("user") User user);

    @Query("SELECT t FROM TimeTracking t WHERE t.todo = :todo ORDER BY t.startTime DESC")
    List<TimeTracking> findByTodoOrderByStartTimeDesc(@Param("todo") Todos todo);

    Optional<TimeTracking> findByUserAndEndTimeIsNull(User user);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM TimeTracking t WHERE t.todo = :todo")
    void deleteByTodo(@Param("todo") Todos todo);
}