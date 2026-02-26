package com.loki.todo.repository;

import com.loki.todo.model.TimeBlock;
import com.loki.todo.model.User;
import com.loki.todo.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TimeBlockRepository extends JpaRepository<TimeBlock, Long> {

    List<TimeBlock> findByUserAndDateBetweenOrderByStartTimeAsc(
            User user,
            LocalDate startDate,
            LocalDate endDate
    );

    List<TimeBlock> findByUserAndWorkspaceAndDateBetweenOrderByStartTimeAsc(
            User user,
            Workspace workspace,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("SELECT t FROM TimeBlock t WHERE t.user = :user AND t.date = :date ORDER BY t.startTime ASC")
    List<TimeBlock> findByUserAndDate(
            @Param("user") User user,
            @Param("date") LocalDate date
    );

    @Query("SELECT t FROM TimeBlock t WHERE t.user = :user AND t.completed = false AND t.startTime < :now")
    List<TimeBlock> findOverdueBlocks(
            @Param("user") User user,
            @Param("now") LocalDateTime now
    );

    // FIXED: This method is correct - uses @Param
    @Query("SELECT t FROM TimeBlock t WHERE t.user.id = :userId AND t.date BETWEEN :startDate AND :endDate")
    List<TimeBlock> findByUserIdAndDateBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    @Query("SELECT tb FROM TimeBlock tb WHERE tb.user.id = :userId AND tb.date = :date AND tb.completed = true")
    List<TimeBlock> findCompletedBlocksForDay(@Param("userId") Long userId, @Param("date") LocalDate date);

    // FIXED: This method might be causing issues - use @Query with proper parameter
    @Query("SELECT t FROM TimeBlock t WHERE t.user = :user")
    List<TimeBlock> findByUser(@Param("user") User user);
}