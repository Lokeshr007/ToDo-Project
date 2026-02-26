package com.loki.todo.repository;

import com.loki.todo.model.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface TodosRepository extends JpaRepository<Todos, Long> {

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    Optional<Todos> findById(Long id);

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    List<Todos> findByWorkspace(Workspace workspace);

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    Page<Todos> findByWorkspace(Workspace workspace, Pageable pageable);

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    List<Todos> findByWorkspaceAndAssignedTo(Workspace workspace, User user);

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    List<Todos> findByWorkspaceAndCreatedBy(Workspace workspace, User user);

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    List<Todos> findByWorkspaceAndStatus(Workspace workspace, Todos.Status status);

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    Page<Todos> findByWorkspaceAndStatus(Workspace workspace, Todos.Status status, Pageable pageable);

    // ADD THIS MISSING METHOD - for filter "pending" (status not completed)
    @Query("SELECT t FROM Todos t WHERE t.workspace = :workspace AND t.status <> :status")
    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    List<Todos> findByWorkspaceAndStatusNot(@Param("workspace") Workspace workspace, @Param("status") Todos.Status status);

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    List<Todos> findByWorkspaceAndPriority(Workspace workspace, Todos.Priority priority);

    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    List<Todos> findByWorkspaceAndProject(Workspace workspace, Project project);

    @Query("SELECT t FROM Todos t WHERE t.workspace = :workspace AND t.dueDate = :date")
    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    List<Todos> findByWorkspaceAndDueDate(@Param("workspace") Workspace workspace, @Param("date") LocalDate date);

    @Query("SELECT t FROM Todos t WHERE t.workspace = :workspace AND t.dueDate < :date AND t.status NOT IN ('COMPLETED', 'ARCHIVED')")
    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    List<Todos> findOverdueInWorkspace(@Param("workspace") Workspace workspace, @Param("date") LocalDate date);

    @Query("SELECT t FROM Todos t WHERE t.workspace = :workspace AND " +
            "(LOWER(t.item) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    @EntityGraph(attributePaths = {
            "createdBy",
            "assignedTo",
            "board",
            "boardColumn",
            "project",
            "workspace"
    })
    List<Todos> searchInWorkspace(@Param("workspace") Workspace workspace, @Param("search") String search);

    @Query("SELECT t FROM Todos t WHERE t.assignedTo.id = :userId")
    List<Todos> findByAssignedToId(@Param("userId") Long userId);

    @Query("SELECT t FROM Todos t WHERE t.assignedTo = :user")
    List<Todos> findByAssignedTo(@Param("user") User user);

    // Count queries
    @Query("SELECT COUNT(t) FROM Todos t WHERE t.workspace = :workspace")
    long countByWorkspace(@Param("workspace") Workspace workspace);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.workspace = :workspace AND t.status NOT IN ('COMPLETED', 'ARCHIVED') AND t.dueDate < CURRENT_DATE")
    long countOverdueInWorkspace(@Param("workspace") Workspace workspace);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.workspace = :workspace AND t.status = 'COMPLETED'")
    long countCompletedInWorkspace(@Param("workspace") Workspace workspace);

    // ADD THIS MISSING METHOD - count pending tasks (not completed)
    @Query("SELECT COUNT(t) FROM Todos t WHERE t.workspace = :workspace AND t.status <> 'COMPLETED'")
    long countPendingInWorkspace(@Param("workspace") Workspace workspace);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.workspace = :workspace AND t.dueDate = CURRENT_DATE")
    long countDueTodayInWorkspace(@Param("workspace") Workspace workspace);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.workspace = :workspace AND t.status = 'IN_PROGRESS'")
    long countInProgressInWorkspace(@Param("workspace") Workspace workspace);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.workspace = :workspace AND t.status = 'BLOCKED'")
    long countBlockedInWorkspace(@Param("workspace") Workspace workspace);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.workspace = :workspace AND t.status = 'BACKLOG'")
    long countBacklogInWorkspace(@Param("workspace") Workspace workspace);

    @Query("SELECT t.status, COUNT(t) FROM Todos t WHERE t.workspace = :workspace GROUP BY t.status")
    List<Object[]> countByStatus(@Param("workspace") Workspace workspace);

    @Query("SELECT t.priority, COUNT(t) FROM Todos t WHERE t.workspace = :workspace GROUP BY t.priority")
    List<Object[]> countByPriority(@Param("workspace") Workspace workspace);

    @Query("SELECT AVG(t.actualHours) FROM Todos t WHERE t.workspace = :workspace AND t.status = 'COMPLETED'")
    Double averageCompletionTime(@Param("workspace") Workspace workspace);

    @Query("SELECT SUM(t.actualHours) FROM Todos t WHERE t.workspace = :workspace AND t.assignedTo = :user AND t.status = 'COMPLETED'")
    Long totalHoursByUser(@Param("workspace") Workspace workspace, @Param("user") User user);

    @Query("SELECT t FROM Todos t WHERE t.workspace = :workspace AND t.deletedAt IS NOT NULL")
    List<Todos> findDeletedByWorkspace(@Param("workspace") Workspace workspace);

    // Include deleted tasks
    @Query("SELECT t FROM Todos t WHERE t.id = :id")
    Optional<Todos> findByIdIncludeDeleted(@Param("id") Long id);

    // Add these methods to your existing TodosRepository.java

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.project.id = :projectId AND t.deletedAt IS NULL")
    long countByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.project.id = :projectId AND t.status = 'COMPLETED' AND t.deletedAt IS NULL")
    long countCompletedByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.project.id = :projectId AND t.deletedAt IS NULL AND t.dueDate < CURRENT_DATE AND t.status <> 'COMPLETED'")
    long countOverdueByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.project.id = :projectId AND t.status = :status AND t.deletedAt IS NULL")
    long countByProjectIdAndStatus(@Param("projectId") Long projectId, @Param("status") Todos.Status status);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.project.id = :projectId AND t.priority = :priority AND t.deletedAt IS NULL")
    long countByProjectIdAndPriority(@Param("projectId") Long projectId, @Param("priority") Todos.Priority priority);

    @Query("SELECT COUNT(t) FROM Todos t WHERE t.board.id = :boardId AND t.deletedAt IS NULL")
    long countByBoardId(@Param("boardId") Long boardId);

    @Query("SELECT t.id as id, t.item as title, t.status as status, t.updatedAt as updatedAt FROM Todos t WHERE t.project.id = :projectId AND t.deletedAt IS NULL ORDER BY t.updatedAt DESC")
    List<Map<String, Object>> findRecentByProjectId(@Param("projectId") Long projectId, Pageable pageable);
}