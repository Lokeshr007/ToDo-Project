// BACKEND-TODO/SRC/main/java/com/loki/todo/repository/AIPlanRepository.java
package com.loki.todo.repository;

import com.loki.todo.model.AIPlan;
import com.loki.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIPlanRepository extends JpaRepository<AIPlan, Long> {
    List<AIPlan> findByUserOrderByCreatedAtDesc(User user);
}