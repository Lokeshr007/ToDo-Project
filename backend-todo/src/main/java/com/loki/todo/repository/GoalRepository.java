package com.loki.todo.repository;

import com.loki.todo.model.Goal;
import com.loki.todo.model.User;
import com.loki.todo.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    List<Goal> findByUser(User user);

    List<Goal> findByUserAndWorkspace(User user, Workspace workspace);

    List<Goal> findByUserAndType(User user, String type);

    @Query("SELECT g FROM Goal g WHERE g.user = :user AND g.endDate >= :date")
    List<Goal> findActiveGoals(@Param("user") User user, @Param("date") LocalDate date);

    @Query("SELECT g FROM Goal g WHERE g.user = :user AND g.progress < 100 AND g.endDate < :date")
    List<Goal> findOverdueGoals(@Param("user") User user, @Param("date") LocalDate date);

    @Query("SELECT COUNT(g) FROM Goal g WHERE g.user = :user AND g.progress >= 100")
    long countCompletedGoals(@Param("user") User user);

    List<Goal> findByProjectId(Long projectId);
}