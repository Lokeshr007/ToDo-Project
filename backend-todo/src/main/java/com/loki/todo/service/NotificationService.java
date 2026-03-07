package com.loki.todo.service;

import com.loki.todo.dto.NotificationDTO;
import com.loki.todo.model.*;
import com.loki.todo.repository.NotificationRepository;
import com.loki.todo.repository.UserRepository;
import com.loki.todo.repository.WorkspaceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private EmailService emailService;

    // Notification types
    public static final String TYPE_TASK_ASSIGNED = "TASK_ASSIGNED";
    public static final String TYPE_TASK_COMPLETED = "TASK_COMPLETED";
    public static final String TYPE_TASK_OVERDUE = "TASK_OVERDUE";
    public static final String TYPE_TASK_MENTION = "TASK_MENTION";
    public static final String TYPE_PROJECT_CREATED = "PROJECT_CREATED";
    public static final String TYPE_PROJECT_MEMBER_ADDED = "PROJECT_MEMBER_ADDED";
    public static final String TYPE_WORKSPACE_INVITE = "WORKSPACE_INVITE";
    public static final String TYPE_WORKSPACE_MEMBER_ADDED = "WORKSPACE_MEMBER_ADDED";
    public static final String TYPE_COMMENT_ADDED = "COMMENT_ADDED";
    public static final String TYPE_REMINDER = "REMINDER";

    @Transactional
    public NotificationDTO createNotification(
            Long userId,
            String type,
            String title,
            String message,
            String actionUrl,
            String icon,
            String color,
            Long workspaceId,
            Long todoId,
            Long projectId,
            Map<String, Object> metadata) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setActionUrl(actionUrl);
        notification.setIcon(icon);
        notification.setColor(color);
        notification.setRead(false);

        if (workspaceId != null) {
            Workspace workspace = workspaceRepository.findById(workspaceId)
                    .orElse(null);
            notification.setWorkspace(workspace);
        }

        // These would need repositories - add them if needed
        // notification.setTodo(todo);
        // notification.setProject(project);

        if (metadata != null && !metadata.isEmpty()) {
            // Convert metadata to JSON string
            notification.setMetadata(metadata.toString());
        }

        Notification saved = notificationRepository.save(notification);
        log.info("Notification created for user: {} - {}", userId, title);

        return NotificationDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUserNotifications(String email, int limit, String filter) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Pageable pageable = PageRequest.of(0, limit, Sort.by("createdAt").descending());
        List<Notification> notifications;

        if ("unread".equalsIgnoreCase(filter)) {
            notifications = notificationRepository.findByUserAndReadOrderByCreatedAtDesc(user, false, pageable);
        } else if ("read".equalsIgnoreCase(filter)) {
            notifications = notificationRepository.findByUserAndReadOrderByCreatedAtDesc(user, true, pageable);
        } else {
            notifications = notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
        }

        return notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Notification> notifications = notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);

        return notifications.stream()
                .map(NotificationDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.countUnreadByUser(user);
    }

    @Transactional
    public NotificationDTO markAsRead(Long notificationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);
        return NotificationDTO.fromEntity(saved);
    }

    @Transactional
    public void markAllAsRead(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationRepository.markAllAsRead(user, LocalDateTime.now());
        log.info("All notifications marked as read for user: {}", email);
    }

    @Transactional
    public void deleteNotification(Long notificationId, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        notificationRepository.delete(notification);
        log.info("Notification deleted: {} for user: {}", notificationId, email);
    }

    @Transactional
    public void cleanupOldNotifications(String email, int daysOld) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysOld);
        notificationRepository.deleteOldNotifications(user, cutoffDate);
        log.info("Cleaned up notifications older than {} days for user: {}", daysOld, email);
    }

    // ============= METHODS REQUIRED BY WORKFLOW ENGINE =============

    /**
     * Send notification when a task is assigned to a user
     */
    @Transactional
    public void sendTaskAssignedNotification(Todos todo) {
        sendTaskAssignedNotification(todo, null);
    }

    @Transactional
    public void sendTaskAssignedNotification(Todos todo, User assignee) {
        if (assignee == null) {
            assignee = todo.getAssignedTo();
        }
        
        if (assignee == null) {
            return;
        }

        User assignedBy = todo.getCreatedBy();

        // Check if user wants notifications
        if (!assignee.isEmailNotifications()) {
            log.debug("User {} has email notifications disabled", assignee.getEmail());
            return;
        }

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("todoId", todo.getId());
        metadata.put("todoTitle", todo.getItem());
        metadata.put("assignedBy", assignedBy != null ? assignedBy.getName() : "System");

        // Create in-app notification
        createNotification(
                assignee.getId(),
                TYPE_TASK_ASSIGNED,
                "Task Assigned",
                (assignedBy != null ? assignedBy.getName() : "System") + " assigned you to task: " + todo.getItem(),
                "/app/todos?id=" + todo.getId(),
                "UserPlus",
                "blue",
                todo.getWorkspace() != null ? todo.getWorkspace().getId() : null,
                todo.getId(),
                todo.getProject() != null ? todo.getProject().getId() : null,
                metadata
        );

        // Send email notification
        /*
        String subject = "Task Assigned: " + todo.getItem();
        String content = String.format(
                "You have been assigned a new task: %s\n\n" +
                        "Description: %s\n" +
                        "Due Date: %s\n" +
                        "Priority: %s\n\n" +
                        "View task in the application.",
                todo.getItem(),
                todo.getDescription() != null ? todo.getDescription() : "No description",
                todo.getDueDate() != null ? todo.getDueDate() : "No due date",
                todo.getPriority() != null ? todo.getPriority().name() : "MEDIUM"
        );

        emailService.sendEmail(assignee.getEmail(), subject, content);
        */
        log.info("Assignment notification sent to: {}", assignee.getEmail());
    }

    /**
     * Send notification when a task is completed
     */

    /**
     * Send notification for overdue tasks
     */
    @Transactional
    public void sendTaskOverdueNotification(Todos todo) {
        if (todo.getAssignedTo() == null) {
            return;
        }

        User assignee = todo.getAssignedTo();

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("todoId", todo.getId());
        metadata.put("todoTitle", todo.getItem());
        metadata.put("dueDate", todo.getDueDate());

        createNotification(
                assignee.getId(),
                TYPE_TASK_OVERDUE,
                "Task Overdue",
                "Task \"" + todo.getItem() + "\" is overdue",
                "/app/todos?id=" + todo.getId(),
                "AlertCircle",
                "red",
                todo.getWorkspace() != null ? todo.getWorkspace().getId() : null,
                todo.getId(),
                todo.getProject() != null ? todo.getProject().getId() : null,
                metadata
        );
    }

    /**
     * Send push notification for reminders
     */
    public void sendPushNotification(Reminder reminder) {
        log.info("Push notification would be sent to user {} for reminder: {}",
                reminder.getUser().getEmail(), reminder.getTitle());

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("reminderId", reminder.getId());
        metadata.put("reminderTitle", reminder.getTitle());
        metadata.put("scheduledFor", reminder.getScheduledFor());

        // Create in-app notification
        createNotification(
                reminder.getUser().getId(),
                TYPE_REMINDER,
                "Reminder: " + reminder.getTitle(),
                reminder.getDescription() != null ? reminder.getDescription() : "You have a reminder",
                reminder.getTodoId() != null ? "/app/todos?id=" + reminder.getTodoId() : "/app/reminders",
                "Bell",
                "yellow",
                null,
                reminder.getTodoId(),
                null,
                metadata
        );

        // Optionally send email as fallback
        // emailService.sendReminderEmail(reminder);
    }

    /**
     * Send notification when someone comments on a task
     */
    @Transactional
    public void sendCommentAddedNotification(Todos todo, User mentionedUser, User commenter, String comment) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("todoId", todo.getId());
        metadata.put("todoTitle", todo.getItem());
        metadata.put("commenter", commenter.getName());
        metadata.put("comment", comment.length() > 50 ? comment.substring(0, 50) + "..." : comment);

        createNotification(
                mentionedUser.getId(),
                TYPE_COMMENT_ADDED,
                "New Comment",
                commenter.getName() + " commented on task: " + todo.getItem(),
                "/app/todos?id=" + todo.getId(),
                "MessageCircle",
                "purple",
                todo.getWorkspace() != null ? todo.getWorkspace().getId() : null,
                todo.getId(),
                todo.getProject() != null ? todo.getProject().getId() : null,
                metadata
        );
    }

    /**
     * Send due date reminder for tasks
     */
    @Transactional
    public void sendDueDateReminder(Todos todo) {
        if (todo.getAssignedTo() == null) {
            return;
        }

        User assignee = todo.getAssignedTo();

        if (!assignee.isEmailNotifications()) {
            log.debug("User {} has email notifications disabled", assignee.getEmail());
            return;
        }

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("todoId", todo.getId());
        metadata.put("todoTitle", todo.getItem());
        metadata.put("dueDate", todo.getDueDate());

        createNotification(
                assignee.getId(),
                TYPE_TASK_OVERDUE,
                "Task Due Soon",
                "Task \"" + todo.getItem() + "\" is due on " + todo.getDueDate(),
                "/app/todos?id=" + todo.getId(),
                "Clock",
                "yellow",
                todo.getWorkspace() != null ? todo.getWorkspace().getId() : null,
                todo.getId(),
                todo.getProject() != null ? todo.getProject().getId() : null,
                metadata
        );

        /*
        String subject = "Task Due Soon: " + todo.getItem();
        String content = String.format(
                "Task is due on %s: %s\n\n" +
                        "Description: %s\n" +
                        "Priority: %s",
                todo.getDueDate(),
                todo.getItem(),
                todo.getDescription() != null ? todo.getDescription() : "No description",
                todo.getPriority() != null ? todo.getPriority().name() : "MEDIUM"
        );

        emailService.sendEmail(assignee.getEmail(), subject, content);
        */
        log.info("Due date reminder sent to: {}", assignee.getEmail());
    }

    @Transactional
    public void sendTaskCompletedNotification(Todos todo) {
        if (todo.getCreatedBy() == null) {
            return;
        }

        User creator = todo.getCreatedBy();
        User completedBy = todo.getAssignedTo() != null ? todo.getAssignedTo() : creator;

        Map<String, Object> metadata = new HashMap<>();
        metadata.put("todoId", todo.getId());
        metadata.put("todoTitle", todo.getItem());
        metadata.put("completedBy", completedBy.getName());

        createNotification(
                creator.getId(),
                TYPE_TASK_COMPLETED,
                "Task Completed",
                completedBy.getName() + " completed task: " + todo.getItem(),
                "/app/todos?id=" + todo.getId(),
                "CheckCircle",
                "green",
                todo.getWorkspace() != null ? todo.getWorkspace().getId() : null,
                todo.getId(),
                todo.getProject() != null ? todo.getProject().getId() : null,
                metadata
        );
    }

    @Transactional
    public void sendWorkspaceMemberAddedNotification(Workspace workspace, User newUser, User invitedBy) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("workspaceId", workspace.getId());
        metadata.put("workspaceName", workspace.getName());
        metadata.put("invitedBy", invitedBy.getName());

        createNotification(
                newUser.getId(),
                TYPE_WORKSPACE_MEMBER_ADDED,
                "Added to Workspace",
                invitedBy.getName() + " added you to workspace: " + workspace.getName(),
                "/app/dashboard",
                "Users",
                "indigo",
                workspace.getId(),
                null,
                null,
                metadata
        );

        /* 
        emailService.sendEmail(
                newUser.getEmail(),
                "Added to Workspace: " + workspace.getName(),
                String.format("You have been added to the workspace '%s' by %s.", workspace.getName(), invitedBy.getName())
        );
        */
    }

    @Transactional
    public void sendProjectMemberAddedNotification(Project project, User newUser, User addedBy) {
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("projectId", project.getId());
        metadata.put("projectName", project.getName());
        metadata.put("addedBy", addedBy.getName());

        createNotification(
                newUser.getId(),
                TYPE_PROJECT_MEMBER_ADDED,
                "Added to Project",
                addedBy.getName() + " added you to project: " + project.getName(),
                "/app/projects/" + project.getId(),
                "FolderKanban",
                "purple",
                project.getWorkspace() != null ? project.getWorkspace().getId() : null,
                null,
                project.getId(),
                metadata
        );

        /*
        emailService.sendEmail(
                newUser.getEmail(),
                "Added to Project: " + project.getName(),
                String.format("You have been added to the project '%s' by %s.", project.getName(), addedBy.getName())
        );
        */
    }
}