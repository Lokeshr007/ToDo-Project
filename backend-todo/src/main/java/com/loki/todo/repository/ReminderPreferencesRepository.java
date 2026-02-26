package com.loki.todo.repository;

import com.loki.todo.model.ReminderPreferences;
import com.loki.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReminderPreferencesRepository extends JpaRepository<ReminderPreferences, Long> {

    Optional<ReminderPreferences> findByUser(User user);

    void deleteByUser(User user);
}