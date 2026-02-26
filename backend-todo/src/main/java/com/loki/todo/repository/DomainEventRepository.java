package com.loki.todo.repository;

import com.loki.todo.model.DomainEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DomainEventRepository extends JpaRepository<DomainEvent,Long> {
    List<DomainEvent> findByProcessedFalse();
}
