package com.loki.todo.service;

import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import com.loki.todo.dto.TodoRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class LearningPathService {

    private final LearningPathRepository learningPathRepo;
    private final ProjectService projectService;
    private final GoalRepository goalRepo;
    private final TodosService todosService;
    private final WorkspaceRepository workspaceRepo;

    @Transactional
    public Project instantiate(Long learningPathId, Long workspaceId, User user) {
        LearningPath path = learningPathRepo.findById(learningPathId)
                .orElseThrow(() -> new RuntimeException("Learning path not found"));

        Workspace workspace = workspaceRepo.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // 1. Create Project
        Project project = projectService.createProject(
                workspaceId,
                path.getTitle(),
                path.getDescription(),
                "#6366f1",
                user.getEmail()
        );

        // 2. Create Goals from Milestones
        for (LearningPathMilestone milestone : path.getMilestones()) {
            Goal goal = new Goal();
            goal.setTitle(milestone.getTitle());
            goal.setDescription(milestone.getDescription());
            goal.setType("CUSTOM");
            goal.setWorkspace(workspace);
            goal.setProject(project);
            goal.setUser(user);
            goal.setStartDate(LocalDate.now().plusDays(milestone.getDayNumber()));
            goal.setEndDate(LocalDate.now().plusDays(milestone.getDayNumber() + 7));
            goal.setTarget(1);
            goal.setUnit("milestone");
            
            Goal savedGoal = goalRepo.save(goal);

            // 3. Optional: Create initial todo for the milestone
            TodoRequest taskReq = new TodoRequest();
            taskReq.setItem("Kickoff: " + milestone.getTitle());
            taskReq.setProjectId(project.getId());
            taskReq.setGoalId(savedGoal.getId());
            taskReq.setPriority("HIGH");
            taskReq.setDueDate(goal.getStartDate());
            
            todosService.addTask(taskReq, user.getEmail());
        }

        log.info("Instantiated learning path '{}' into project '{}' for user {}", 
                path.getTitle(), project.getName(), user.getEmail());
                
        return project;
    }
}
