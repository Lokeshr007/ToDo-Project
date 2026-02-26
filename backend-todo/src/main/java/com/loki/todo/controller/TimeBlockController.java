package com.loki.todo.controller;

import com.loki.todo.dto.TimeBlockDTO;
import com.loki.todo.model.User;
import com.loki.todo.security.CurrentUser;
import com.loki.todo.service.TimeBlockService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/time-blocks")
@RequiredArgsConstructor
public class TimeBlockController {

    @Autowired
    private final TimeBlockService timeBlockService;

    @PostMapping
    public ResponseEntity<TimeBlockDTO> createTimeBlock(@RequestBody TimeBlockDTO timeBlockDTO, @CurrentUser User user) {
        return ResponseEntity.ok(timeBlockService.createTimeBlock(timeBlockDTO, user));
    }

    @GetMapping
    public ResponseEntity<List<TimeBlockDTO>> getTimeBlocks(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @CurrentUser User user) {
        return ResponseEntity.ok(timeBlockService.getTimeBlocks(startDate, endDate, user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TimeBlockDTO> updateTimeBlock(@PathVariable Long id, @RequestBody TimeBlockDTO timeBlockDTO, @CurrentUser User user) {
        return ResponseEntity.ok(timeBlockService.updateTimeBlock(id, timeBlockDTO, user));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTimeBlock(@PathVariable Long id, @CurrentUser User user) {
        timeBlockService.deleteTimeBlock(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reorder")
    public ResponseEntity<Void> reorderTimeBlocks(@RequestBody List<TimeBlockDTO> blocks, @CurrentUser User user) {
        timeBlockService.reorderTimeBlocks(blocks, user);
        return ResponseEntity.ok().build();
    }
}