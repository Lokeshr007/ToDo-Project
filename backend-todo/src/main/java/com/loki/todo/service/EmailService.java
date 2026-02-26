package com.loki.todo.service;

import com.loki.todo.model.Reminder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Your Todo App OTP");
        message.setText(
                "Your OTP is: " + otp + "\n" +
                        "Valid for 5 minutes.\n\n" +
                        "If you didn't request this, please ignore this email."
        );
        mailSender.send(message);
    }

    public void sendEmail(String to, String subject, String content) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject(subject);
        message.setText(content);
        mailSender.send(message);
    }

    // NEW METHOD - Add this
    public void sendReminderEmail(Reminder reminder) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(reminder.getUser().getEmail());
        message.setSubject("Reminder: " + reminder.getTitle());

        StringBuilder content = new StringBuilder();
        content.append("Reminder: ").append(reminder.getTitle()).append("\n\n");

        if (reminder.getDescription() != null && !reminder.getDescription().isEmpty()) {
            content.append("Description: ").append(reminder.getDescription()).append("\n\n");
        }

        content.append("Scheduled for: ").append(reminder.getScheduledFor()).append("\n");

        if (reminder.getTodoId() != null) {
            content.append("Linked to a task in your todo list.");
        }

        message.setText(content.toString());
        mailSender.send(message);
    }
}