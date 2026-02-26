package com.loki.todo.service;

import com.loki.todo.dto.ReminderDTO;
import com.loki.todo.dto.ReminderPreferencesDTO;
import com.loki.todo.dto.TodoDTO;
import com.loki.todo.exception.ResourceNotFoundException;
import com.loki.todo.model.Reminder;
import com.loki.todo.model.ReminderPreferences;
import com.loki.todo.model.User;
import com.loki.todo.model.Todos;
import com.loki.todo.repository.ReminderRepository;
import com.loki.todo.repository.ReminderPreferencesRepository;
import com.loki.todo.repository.TodosRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReminderService {

    private final ReminderRepository reminderRepository;
    private final ReminderPreferencesRepository preferencesRepository;
    private final TodosRepository todosRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Transactional
    public ReminderDTO scheduleReminder(ReminderDTO dto, User user) {
        Reminder reminder = new Reminder();
        mapDtoToEntity(dto, reminder);
        reminder.setUser(user);

        Reminder savedReminder = reminderRepository.save(reminder);
        return mapEntityToDto(savedReminder);
    }

    public List<ReminderDTO> getPendingReminders(User user) {
        return reminderRepository.findByUserAndCompletedFalseOrderByScheduledForAsc(user)
                .stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReminderDTO snoozeReminder(Long id, int minutes, User user) {
        Reminder reminder = findReminderByIdAndUser(id, user);
        reminder.setScheduledFor(reminder.getScheduledFor().plusMinutes(minutes));
        reminder.setSnoozed(true);
        reminder.setSnoozeCount(reminder.getSnoozeCount() + 1);
        reminder.setTriggered(false);

        Reminder snoozedReminder = reminderRepository.save(reminder);
        return mapEntityToDto(snoozedReminder);
    }

    @Transactional
    public void completeReminder(Long id, User user) {
        Reminder reminder = findReminderByIdAndUser(id, user);
        reminder.setCompleted(true);
        reminder.setCompletedAt(LocalDateTime.now());
        reminderRepository.save(reminder);
    }

    @Transactional
    public void deleteReminder(Long id, User user) {
        Reminder reminder = findReminderByIdAndUser(id, user);
        reminderRepository.delete(reminder);
    }

    @Transactional
    public void setReminderPreferences(ReminderPreferencesDTO dto, User user) {
        ReminderPreferences preferences = preferencesRepository.findByUser(user)
                .orElse(new ReminderPreferences());

        preferences.setUser(user);
        preferences.setEmailEnabled(dto.getEmailEnabled());
        preferences.setPushEnabled(dto.getPushEnabled());
        preferences.setSmsEnabled(dto.getSmsEnabled());
        preferences.setDefaultLeadTime(dto.getDefaultLeadTime());
        preferences.setQuietHoursStart(dto.getQuietHoursStart());
        preferences.setQuietHoursEnd(dto.getQuietHoursEnd());
        preferences.setWeekdayOnly(dto.getWeekdayOnly());
        preferences.setIntelligentReminders(dto.getIntelligentReminders());
        preferences.setReminderFrequency(dto.getReminderFrequency());
        preferences.setMaxReminders(dto.getMaxReminders());

        preferencesRepository.save(preferences);
    }

    public ReminderPreferencesDTO getReminderPreferences(User user) {
        ReminderPreferences preferences = preferencesRepository.findByUser(user)
                .orElseGet(() -> {
                    ReminderPreferences newPrefs = new ReminderPreferences();
                    newPrefs.setUser(user);
                    return preferencesRepository.save(newPrefs);
                });

        return mapPreferencesToDto(preferences);
    }

    @Scheduled(fixedRate = 60000) // Check every minute
    @Transactional
    public void processDueReminders() {
        LocalDateTime now = LocalDateTime.now();
        List<Reminder> dueReminders = reminderRepository.findDueReminders(null, now);

        for (Reminder reminder : dueReminders) {
            try {
                if (shouldSendReminder(reminder)) {
                    sendReminder(reminder);
                    reminder.setTriggered(true);
                    reminder.setTriggeredAt(now);
                    reminderRepository.save(reminder);

                    // Schedule follow-up if needed
                    if (shouldScheduleFollowUp(reminder)) {
                        scheduleFollowUpReminder(reminder);
                    }
                }
            } catch (Exception e) {
                log.error("Failed to process reminder: {}", reminder.getId(), e);
            }
        }
    }

    private boolean shouldSendReminder(Reminder reminder) {
        ReminderPreferences prefs = preferencesRepository.findByUser(reminder.getUser())
                .orElse(null);

        if (prefs == null) return true;

        // Check quiet hours
        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();
        LocalTime quietStart = LocalTime.parse(prefs.getQuietHoursStart());
        LocalTime quietEnd = LocalTime.parse(prefs.getQuietHoursEnd());

        boolean isQuietHours;
        if (quietStart.isBefore(quietEnd)) {
            isQuietHours = currentTime.isAfter(quietStart) && currentTime.isBefore(quietEnd);
        } else {
            isQuietHours = currentTime.isAfter(quietStart) || currentTime.isBefore(quietEnd);
        }

        if (isQuietHours) {
            // Reschedule for after quiet hours
            LocalDateTime rescheduleTime = now.with(quietEnd).plusMinutes(5);
            reminder.setScheduledFor(rescheduleTime);
            reminderRepository.save(reminder);
            return false;
        }

        // Check weekday only
        if (prefs.getWeekdayOnly()) {
            int dayOfWeek = now.getDayOfWeek().getValue();
            if (dayOfWeek >= 6) { // Saturday or Sunday
                LocalDateTime nextMonday = now.plusDays(8 - dayOfWeek)
                        .withHour(9).withMinute(0);
                reminder.setScheduledFor(nextMonday);
                reminderRepository.save(reminder);
                return false;
            }
        }

        return true;
    }

    private void sendReminder(Reminder reminder) {
        ReminderPreferences prefs = preferencesRepository.findByUser(reminder.getUser())
                .orElse(null);

        if (prefs == null) return;

        // Send via selected channels
        if (reminder.getChannels().contains("email") && prefs.getEmailEnabled()) {
            emailService.sendReminderEmail(reminder);
        }

        if (reminder.getChannels().contains("push") && prefs.getPushEnabled()) {
            notificationService.sendPushNotification(reminder);
        }

        if (reminder.getChannels().contains("sms") && prefs.getSmsEnabled()) {
            // Send SMS if implemented
        }
    }

    private boolean shouldScheduleFollowUp(Reminder reminder) {
        ReminderPreferences prefs = preferencesRepository.findByUser(reminder.getUser())
                .orElse(null);

        if (prefs == null) return false;

        return prefs.getIntelligentReminders() &&
                reminder.getSnoozeCount() < prefs.getMaxReminders() &&
                reminder.getTodoId() != null;
    }

    private void scheduleFollowUpReminder(Reminder originalReminder) {
        Reminder followUp = new Reminder();
        followUp.setTitle("Follow-up: " + originalReminder.getTitle());
        followUp.setDescription("Don't forget to complete your task");
        followUp.setScheduledFor(LocalDateTime.now().plusHours(1));
        followUp.setUser(originalReminder.getUser());
        followUp.setTodoId(originalReminder.getTodoId());
        followUp.setChannels(originalReminder.getChannels());

        reminderRepository.save(followUp);
    }

    private Reminder findReminderByIdAndUser(Long id, User user) {
        return reminderRepository.findById(id)
                .filter(reminder -> reminder.getUser().equals(user))
                .orElseThrow(() -> new ResourceNotFoundException("Reminder not found"));
    }

    private void mapDtoToEntity(ReminderDTO dto, Reminder entity) {
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setScheduledFor(dto.getScheduledFor());
        entity.setTriggered(dto.getTriggered() != null ? dto.getTriggered() : false);
        entity.setCompleted(dto.getCompleted() != null ? dto.getCompleted() : false);
        entity.setCompletedAt(dto.getCompletedAt());
        entity.setSnoozed(dto.getSnoozed() != null ? dto.getSnoozed() : false);
        entity.setSnoozeCount(dto.getSnoozeCount() != null ? dto.getSnoozeCount() : 0);
        entity.setTodoId(dto.getTodoId());
        entity.setReminderType(dto.getReminderType());
        entity.setLeadTime(dto.getLeadTime());
        entity.setChannels(dto.getChannels() != null ? dto.getChannels() : List.of("push"));
    }

    private ReminderDTO mapEntityToDto(Reminder entity) {
        ReminderDTO dto = new ReminderDTO();
        dto.setId(entity.getId());
        dto.setTitle(entity.getTitle());
        dto.setDescription(entity.getDescription());
        dto.setScheduledFor(entity.getScheduledFor());
        dto.setTriggered(entity.getTriggered());
        dto.setCompleted(entity.getCompleted());
        dto.setCompletedAt(entity.getCompletedAt());
        dto.setSnoozed(entity.getSnoozed());
        dto.setSnoozeCount(entity.getSnoozeCount());
        dto.setTodoId(entity.getTodoId());
        dto.setReminderType(entity.getReminderType());
        dto.setLeadTime(entity.getLeadTime());
        dto.setChannels(entity.getChannels());
        dto.setUserId(entity.getUser().getId());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());

        // Load todo if exists
        if (entity.getTodoId() != null) {
            todosRepository.findById(entity.getTodoId()).ifPresent(todo -> {
                TodoDTO todoDTO = new TodoDTO();
                todoDTO.setId(todo.getId());
                todoDTO.setTitle(todo.getItem());
                dto.setTodo(todoDTO);
            });
        }

        return dto;
    }

    private ReminderPreferencesDTO mapPreferencesToDto(ReminderPreferences entity) {
        ReminderPreferencesDTO dto = new ReminderPreferencesDTO();
        dto.setId(entity.getId());
        dto.setEmailEnabled(entity.getEmailEnabled());
        dto.setPushEnabled(entity.getPushEnabled());
        dto.setSmsEnabled(entity.getSmsEnabled());
        dto.setDefaultLeadTime(entity.getDefaultLeadTime());
        dto.setQuietHoursStart(entity.getQuietHoursStart());
        dto.setQuietHoursEnd(entity.getQuietHoursEnd());
        dto.setWeekdayOnly(entity.getWeekdayOnly());
        dto.setIntelligentReminders(entity.getIntelligentReminders());
        dto.setReminderFrequency(entity.getReminderFrequency());
        dto.setMaxReminders(entity.getMaxReminders());
        dto.setUserId(entity.getUser().getId());
        return dto;
    }
}