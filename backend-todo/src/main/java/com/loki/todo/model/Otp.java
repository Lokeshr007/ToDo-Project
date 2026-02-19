package com.loki.todo.model;

import jakarta.persistence.Entity;

import java.time.LocalDateTime;


public class Otp {
    String email;
    String code;
    LocalDateTime expiry;
}
