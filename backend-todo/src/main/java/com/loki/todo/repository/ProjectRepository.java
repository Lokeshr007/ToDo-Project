package com.loki.todo.repository;

import com.loki.todo.model.Project;
import com.loki.todo.model.User;
import com.loki.todo.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByWorkspace(Workspace workspace);

    List<Project> findByWorkspaceOrderByCreatedAtDesc(Workspace workspace);

    List<Project> findByCreatedBy(User user);

    List<Project> findByCreatedById(Long userId);

    boolean existsByWorkspaceAndName(Workspace workspace, String name);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.workspace.id = :workspaceId")
    long countByWorkspaceId(@Param("workspaceId") Long workspaceId);

    @Query("SELECT p FROM Project p WHERE p.createdBy.id = :userId ORDER BY p.createdAt DESC")
    List<Project> findByCreatedByIdOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) FROM Project p WHERE p.workspace = :workspace")
    long countByWorkspace(@Param("workspace") Workspace workspace);
}