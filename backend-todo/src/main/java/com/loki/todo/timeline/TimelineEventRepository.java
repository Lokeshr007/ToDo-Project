package com.loki.todo.timeline;

import com.loki.todo.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TimelineEventRepository
        extends JpaRepository<TimelineEvent,Long> {

    List<TimelineEvent> findByWorkspaceOrderByCreatedAtDesc(Workspace workspace);
}
