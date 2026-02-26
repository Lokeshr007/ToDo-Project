package com.loki.todo.repository;

import com.loki.todo.model.Comment;
import com.loki.todo.model.Todos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByTodoOrderByCreatedAtDesc(Todos todo);

    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.todo = :todo")
    void deleteByTodo(@Param("todo") Todos todo);
}

