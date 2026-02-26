package com.loki.todo.repository;

import com.loki.todo.model.SmartTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SmartTaskRepository
        extends JpaRepository<SmartTask, Long> {

    List<SmartTask> findByBoardId(Long boardId);
}
