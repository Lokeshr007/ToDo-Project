package com.loki.todo.workflow;

import com.loki.todo.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WorkflowRuleRepository extends JpaRepository<WorkflowRule,Long> {

    List<WorkflowRule> findByWorkspaceAndEventType(
            Workspace workspace,
            WorkflowEventType type);
}