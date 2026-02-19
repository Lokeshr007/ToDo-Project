package com.loki.todo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtp(String to,String otp){
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(to);
        message.setSubject("Your Todo App OTP");

        message.setText(
                "Your OTP is: " + otp +"\nValid for 5 minutes."
        );

        mailSender.send(message);
    }
}
