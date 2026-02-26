package com.loki.todo.repository;

import com.loki.todo.model.Membership;
import com.loki.todo.model.User;
import com.loki.todo.model.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MembershipRepository extends JpaRepository<Membership, Long> {

    List<Membership> findByUser(User user);

    Optional<Membership> findByUserAndWorkspace(User user, Workspace workspace);

    boolean existsByUserAndWorkspace(User user, Workspace workspace);

    @Query("SELECT COUNT(m) > 0 FROM Membership m WHERE m.user = :user AND m.workspace.id = :workspaceId AND m.active = true")
    boolean existsByUserAndWorkspaceId(@Param("user") User user, @Param("workspaceId") Long workspaceId);


    Optional<Membership> findFirstByUser(User user);

    @Query("SELECT m FROM Membership m WHERE m.user = :user AND m.workspace = :workspace")
    Optional<Membership> findByUserAndWorkspaceId(@Param("user") User user, @Param("workspace") Workspace workspace);

    // Add these methods to MembershipRepository.java

    @Query("SELECT COUNT(m) FROM Membership m WHERE m.workspace = :workspace AND m.active = true")
    long countByWorkspace(@Param("workspace") Workspace workspace);

    @Query("SELECT m FROM Membership m WHERE m.workspace = :workspace AND m.active = true")
    List<Membership> findByWorkspaceAndActiveTrue(@Param("workspace") Workspace workspace);
}