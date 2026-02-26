package com.loki.todo.repository;

import com.loki.todo.model.DeviceSession;
import com.loki.todo.model.RefreshToken;
import com.loki.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUser(User user);

    List<RefreshToken> findByUser(User user);

    void deleteAllByUser(User user);

    void deleteAllByDeviceSession(DeviceSession deviceSession);

    void deleteByDeviceSession(DeviceSession deviceSession);

    List<RefreshToken> findByDeviceSessionId(Long deviceSessionId);
}