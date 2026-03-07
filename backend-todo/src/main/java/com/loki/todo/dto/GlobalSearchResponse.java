package com.loki.todo.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class GlobalSearchResponse {
    private List<SearchResult> results;

    @Data
    @Builder
    public static class SearchResult {
        private String id;
        private String type; // task, project, board
        private String title;
        private String description;
        private String status;
        private String priority;
        private String color;
        private WorkspaceInfo workspace;
    }

    @Data
    @Builder
    public static class WorkspaceInfo {
        private Long id;
        private String name;
    }
}
