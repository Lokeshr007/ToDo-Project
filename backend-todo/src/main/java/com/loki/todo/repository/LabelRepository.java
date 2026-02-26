package com.loki.todo.repository;

import com.loki.todo.model.Label;
import com.loki.todo.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabelRepository extends JpaRepository<Label, Long> {
    List<Label> findByWorkspace(Workspace workspace);
    boolean existsByNameAndWorkspace(String name, Workspace workspace);
}