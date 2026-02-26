package com.loki.todo.repository;

import com.loki.todo.model.DeviceSession;
import com.loki.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceSessionRepository extends JpaRepository<DeviceSession, Long> {

    List<DeviceSession> findByUserAndActive(User user, boolean active);

    List<DeviceSession> findByUser(User user);

    // Add this method for AuthService
    List<DeviceSession> findByUserAndActiveTrue(User user);

    // Helper method
    default List<DeviceSession> findByUserIdAndActiveTrue(Long userId) {
        User user = new User();
        user.setId(userId);
        return findByUserAndActiveTrue(user);
    }
}