package com.loki.todo.repository;

import com.loki.todo.model.Todos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TodosRepository extends JpaRepository<Todos,Long> {
    ;
}
