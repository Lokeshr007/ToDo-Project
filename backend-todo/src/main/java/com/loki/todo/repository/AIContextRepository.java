package com.loki.todo.repository;

import com.loki.todo.model.AIContext;
import com.loki.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AIContextRepository extends JpaRepository<AIContext, Long> {

    Optional<AIContext> findBySessionIdAndUser(String sessionId, User user);

    Optional<AIContext> findBySessionId(String sessionId);


    @Query("SELECT c FROM AIContext c WHERE c.user = :user ORDER BY c.lastInteraction DESC")
    Optional<AIContext> findLatestByUser(@Param("user") User user);

    void deleteBySessionIdAndUser(String sessionId, User user);
}