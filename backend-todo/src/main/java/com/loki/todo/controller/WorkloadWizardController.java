package com.loki.todo.controller;

import com.loki.todo.dto.WorkloadAnalysisDTO;
import com.loki.todo.service.WorkloadWizardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspace/{workspaceId}/workload-analysis")
@RequiredArgsConstructor
public class WorkloadWizardController {

    private final WorkloadWizardService workloadService;

    @GetMapping
    public ResponseEntity<WorkloadAnalysisDTO> analyzeWorkspace(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(workloadService.analyzeWorkspace(workspaceId));
    }
}
