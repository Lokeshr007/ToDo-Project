package com.loki.todo.domain.repository;

import com.loki.todo.model.Todos;
import com.loki.todo.model.Workspace;

import java.util.List;
import java.util.Optional;

public interface TodosDomainRepository {

    Todos save(Todos todo);

    Optional<Todos> findById(Long id);

    List<Todos> findByWorkspace(Workspace workspace);

    void delete(Todos todo);
}