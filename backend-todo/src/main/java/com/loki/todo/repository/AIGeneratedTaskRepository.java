// BACKEND-TODO/SRC/main/java/com/loki/todo/repository/AIGeneratedTaskRepository.java
package com.loki.todo.repository;

import com.loki.todo.model.AIGeneratedTask;
import com.loki.todo.model.AIPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIGeneratedTaskRepository extends JpaRepository<AIGeneratedTask, Long> {
    List<AIGeneratedTask> findByPlanOrderByDayNumberAsc(AIPlan plan);
    List<AIGeneratedTask> findByAcceptedFalse();
}