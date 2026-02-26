package com.loki.todo.service;

import com.loki.todo.security.WorkspaceContext;
import com.loki.todo.model.Membership;
import com.loki.todo.model.User;
import com.loki.todo.model.Workspace;
import com.loki.todo.repository.MembershipRepository;
import com.loki.todo.repository.UserRepository;
import com.loki.todo.repository.WorkspaceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component

public class WorkspaceSecurityService{
    @Autowired
    private UserRepository userRepo;

    @Autowired
    private WorkspaceRepository workspaceRepo;

    @Autowired
    private MembershipRepository membershipRepo;

    Membership getMembership(String email, Workspace workspace){

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return membershipRepo.findByUserAndWorkspace(user, workspace).orElseThrow(()->new RuntimeException("User not in workspace") );
    }

    Membership validateWorkspace(Long workspaceId, String email){

        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        return getMembership(email, workspace);
    }


    public Membership validateCurrentWorkspace(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(()-> new RuntimeException("User not Found"));
        Long workspaceId = WorkspaceContext.getWorkspaceId();
        Workspace workspace = workspaceRepo.findById(workspaceId).orElseThrow(()-> new RuntimeException("Not Found Workspace"));
        return membershipRepo.findByUserAndWorkspace(user,workspace).orElseThrow();
    }

    public static class NotificationService {
    }
}