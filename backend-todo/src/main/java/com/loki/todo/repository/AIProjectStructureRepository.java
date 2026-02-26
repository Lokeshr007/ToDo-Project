package com.loki.todo.repository;

import com.loki.todo.model.AIProjectStructure;
import com.loki.todo.model.EnhancedAIPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AIProjectStructureRepository extends JpaRepository<AIProjectStructure, Long> {

    Optional<AIProjectStructure> findByPlan(EnhancedAIPlan plan);

    Optional<AIProjectStructure> findByCreatedProjectId(Long projectId);
}