package com.loki.todo.repository;

import com.loki.todo.model.Project;
import com.loki.todo.model.Todos;
import com.loki.todo.model.Workspace;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public class TodosSpecification {

    public static Specification<Todos> hasWorkspace(Workspace workspace) {
        return (root, query, cb) -> cb.and(
            cb.equal(root.get("workspace"), workspace),
            cb.isNull(root.get("deletedAt"))
        );
    }

    public static Specification<Todos> hasProjectId(Long projectId) {
        return (root, query, cb) -> cb.equal(root.get("project").get("id"), projectId);
    }

    public static Specification<Todos> hasStatus(Todos.Status status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<Todos> hasPriority(Todos.Priority priority) {
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }

    public static Specification<Todos> hasAssigneeId(Long assigneeId) {
        return (root, query, cb) -> cb.equal(root.get("assignedTo").get("id"), assigneeId);
    }

    public static Specification<Todos> hasDueDate(LocalDate date) {
        return (root, query, cb) -> cb.equal(root.get("dueDate"), date);
    }

    public static Specification<Todos> isOverdue() {
        return (root, query, cb) -> cb.and(
            cb.lessThan(root.get("dueDate"), LocalDate.now()),
            cb.notEqual(root.get("status"), Todos.Status.COMPLETED)
        );
    }

    public static Specification<Todos> search(String query) {
        return (root, queryObj, cb) -> {
            String pattern = "%" + query.toLowerCase() + "%";
            return cb.or(
                cb.like(cb.lower(root.get("item")), pattern),
                cb.like(cb.lower(root.get("description")), pattern)
            );
        };
    }
}
