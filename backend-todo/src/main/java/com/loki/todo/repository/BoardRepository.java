package com.loki.todo.repository;

import com.loki.todo.model.Board;
import com.loki.todo.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    List<Board> findByProjectOrderByOrderIndex(Project project);

    boolean existsByProjectAndName(Project project, String name);

    @Query("SELECT COUNT(b) FROM Board b WHERE b.project.id = :projectId")
    long countByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT b FROM Board b WHERE b.project.id = :projectId ORDER BY b.orderIndex ASC")
    List<Board> findByProjectIdOrderByOrderIndex(@Param("projectId") Long projectId);
}