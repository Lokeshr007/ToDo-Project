package com.loki.todo.controller;

import com.loki.todo.model.SmartTask;
import com.loki.todo.service.SmartTaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
public class SmartTaskController {

    @Autowired
    private SmartTaskService smartTaskService;

    @PostMapping
    public SmartTask create(
            @RequestBody Map<String,String> body
    ){
        Long boardId = Long.parseLong(body.get("boardId"));

        return smartTaskService.create(
                boardId,
                body.get("title"),
                body.get("description")
        );
    }

    @GetMapping("/board/{boardId}")
    public List<SmartTask> list(
            @PathVariable Long boardId
    ){
        return smartTaskService.getBoardTasks(boardId);
    }
}
