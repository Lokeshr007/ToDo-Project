package com.loki.todo.repository;

import com.loki.todo.model.EnhancedAIPlan;
import com.loki.todo.model.EnhancedAITask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EnhancedAITaskRepository extends JpaRepository<EnhancedAITask, Long> {

    List<EnhancedAITask> findByPlan(EnhancedAIPlan plan);

    List<EnhancedAITask> findByPlanAndAcceptedTrue(EnhancedAIPlan plan);

    List<EnhancedAITask> findByPlanAndAcceptedFalse(EnhancedAIPlan plan);

    @Query("SELECT t FROM EnhancedAITask t WHERE t.plan = :plan ORDER BY t.dayNumber ASC, t.orderIndex ASC")
    List<EnhancedAITask> findByPlanOrdered(@Param("plan") EnhancedAIPlan plan);

    @Query("SELECT t FROM EnhancedAITask t WHERE t.plan = :plan AND t.weekNumber = :weekNumber")
    List<EnhancedAITask> findByPlanAndWeek(@Param("plan") EnhancedAIPlan plan, @Param("weekNumber") Integer weekNumber);

    Long countByPlanAndAcceptedTrue(EnhancedAIPlan plan);
}