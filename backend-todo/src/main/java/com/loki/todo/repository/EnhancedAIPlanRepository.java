package com.loki.todo.repository;

import com.loki.todo.model.EnhancedAIPlan;
import com.loki.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnhancedAIPlanRepository extends JpaRepository<EnhancedAIPlan, Long> {

    List<EnhancedAIPlan> findByUserOrderByCreatedAtDesc(User user);

    Optional<EnhancedAIPlan> findByIdAndUser(Long id, User user);

    @Query("SELECT p FROM EnhancedAIPlan p WHERE p.user = :user AND p.workspace.id = :workspaceId")
    List<EnhancedAIPlan> findByUserAndWorkspace(@Param("user") User user, @Param("workspaceId") Long workspaceId);

    @Query("SELECT p FROM EnhancedAIPlan p WHERE p.user = :user AND p.category = :category")
    List<EnhancedAIPlan> findByUserAndCategory(@Param("user") User user, @Param("category") String category);

    Long countByUser(User user);
}