package com.loki.todo.dto;

import com.loki.todo.model.Membership;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MemberDTO {
    private Long id;
    private Long userId;
    private String name;

    private String email;
    private String role;
    private LocalDateTime joinedAt;

    public static MemberDTO fromEntity(Membership membership) {
        return new MemberDTO(
                membership.getId(),
                membership.getUser().getId(),
                membership.getUser().getName(),
                membership.getUser().getEmail(),
                membership.getRole().name(),
                membership.getJoinedAt() != null ? membership.getJoinedAt() : LocalDateTime.now()
        );
    }
}