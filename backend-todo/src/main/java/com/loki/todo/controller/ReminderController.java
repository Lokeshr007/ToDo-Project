package com.loki.todo.controller;

import com.loki.todo.dto.ReminderDTO;
import com.loki.todo.dto.ReminderPreferencesDTO;
import com.loki.todo.model.User;
import com.loki.todo.security.CurrentUser;
import com.loki.todo.service.ReminderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
public class ReminderController {

    private final ReminderService reminderService;

    @PostMapping("/schedule")
    public ResponseEntity<ReminderDTO> scheduleReminder(@RequestBody ReminderDTO reminderDTO, @CurrentUser User user) {
        return ResponseEntity.ok(reminderService.scheduleReminder(reminderDTO, user));
    }

    @GetMapping("/pending")
    public ResponseEntity<List<ReminderDTO>> getPendingReminders(@CurrentUser User user) {
        return ResponseEntity.ok(reminderService.getPendingReminders(user));
    }

    @PostMapping("/{id}/snooze")
    public ResponseEntity<ReminderDTO> snoozeReminder(@PathVariable Long id, @RequestBody java.util.Map<String, Integer> body, @CurrentUser User user) {
        int minutes = body.getOrDefault("minutes", 15);
        return ResponseEntity.ok(reminderService.snoozeReminder(id, minutes, user));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<Void> completeReminder(@PathVariable Long id, @CurrentUser User user) {
        reminderService.completeReminder(id, user);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id, @CurrentUser User user) {
        reminderService.deleteReminder(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/preferences")
    public ResponseEntity<Void> setReminderPreferences(@RequestBody ReminderPreferencesDTO preferences, @CurrentUser User user) {
        reminderService.setReminderPreferences(preferences, user);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<ReminderPreferencesDTO> getReminderPreferences(@CurrentUser User user) {
        return ResponseEntity.ok(reminderService.getReminderPreferences(user));
    }
}