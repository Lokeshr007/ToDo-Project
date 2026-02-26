package com.loki.todo.repository;

import com.loki.todo.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByUserIdOrderByTimestampDesc(Long userId);

    @Query("SELECT a FROM Activity a WHERE a.userId = :userId ORDER BY a.timestamp DESC")
    List<Activity> findRecentByUserId(@Param("userId") Long userId, @Param("limit") int limit);

    List<Activity> findByUserId(Long userId);
}