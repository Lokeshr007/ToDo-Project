package com.loki.todo.dto;

import com.loki.todo.model.DeviceSession;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionDTO {
    private Long id;
    private String deviceName;
    private String ipAddress;
    private String userAgent;
    private LocalDateTime createdAt;
    private LocalDateTime lastActive;
    private boolean current;
    private String deviceType;
    private String browser;
    private String os;
    private String location;
    private LocalDateTime lastUsed;
    private boolean trusted;

    public static SessionDTO fromEntity(DeviceSession session, boolean isCurrent) {
        return SessionDTO.builder()
                .id(session.getId())
                .deviceName(session.getDeviceName())
                .deviceType(session.getDeviceType())
                .browser(session.getBrowser())
                .os(session.getOs())
                .ipAddress(session.getIpAddress())
                .location(session.getLocation())
                .userAgent(session.getUserAgent())
                .lastUsed(session.getLastUsed())
                .lastActive(session.getLastUsed())
                .createdAt(session.getCreatedAt())
                .current(isCurrent)
                .trusted(session.isTrusted())
                .build();
    }
}