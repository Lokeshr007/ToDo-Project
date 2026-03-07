package com.loki.todo.controller;

import com.loki.todo.dto.TimelineTaskDTO;
import com.loki.todo.service.ProjectTimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/timeline")
@RequiredArgsConstructor
public class ProjectTimelineController {

    private final ProjectTimelineService timelineService;

    @GetMapping
    public ResponseEntity<List<TimelineTaskDTO>> getProjectTimeline(@PathVariable Long projectId) {
        return ResponseEntity.ok(timelineService.getProjectTimeline(projectId));
    }
}
