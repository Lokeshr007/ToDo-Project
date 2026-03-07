package com.loki.todo.repository;

import com.loki.todo.model.Board;
import com.loki.todo.model.BoardColumn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardColumnRepository extends JpaRepository<BoardColumn, Long> {
    List<BoardColumn> findByBoardAndDeletedAtIsNullOrderByOrderIndex(Board board);

    @Query("SELECT c FROM BoardColumn c LEFT JOIN FETCH c.todos WHERE c.board = :board AND c.deletedAt IS NULL ORDER BY c.orderIndex ASC")
    List<BoardColumn> findByBoardWithTodos(@Param("board") Board board);

    boolean existsByBoardAndNameAndDeletedAtIsNull(Board board, String name);

    Optional<BoardColumn> findByBoardAndTypeAndDeletedAtIsNull(Board board, BoardColumn.ColumnType type);

    @Query("SELECT MAX(c.orderIndex) FROM BoardColumn c WHERE c.board = :board AND c.deletedAt IS NULL")
    Optional<Double> findMaxOrderIndex(@Param("board") Board board);
}