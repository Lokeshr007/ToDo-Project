package com.loki.todo.repository;

import com.loki.todo.model.Board;
import com.loki.todo.model.BoardActivity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BoardActivityRepository extends JpaRepository<BoardActivity, Long> {

    List<BoardActivity> findByBoardOrderByTimestampDesc(Board board, Pageable pageable);

    List<BoardActivity> findByBoardAndTimestampAfterOrderByTimestampDesc(Board board, LocalDateTime after);

    @Query("SELECT COUNT(a) FROM BoardActivity a WHERE a.board = :board AND a.type = 'TASK_MOVED'")
    long countMovements(@Param("board") Board board);

    @Query("SELECT a FROM BoardActivity a WHERE a.todo.id = :todoId ORDER BY a.timestamp DESC")
    List<BoardActivity> findByTodoId(@Param("todoId") Long todoId);
}