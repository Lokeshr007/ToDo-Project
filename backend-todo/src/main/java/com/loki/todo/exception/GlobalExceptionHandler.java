package com.loki.todo.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(
            RuntimeException ex
    ){

        Map<String , Object> error = new HashMap<>();

        error.put("timestamp", LocalDateTime.now());
        error.put("message",ex.getMessage());
        error.put("status",400);

        return ResponseEntity
                .badRequest()
                .body(error);
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleException(
            Exception ex
    ){
        Map<String,Object> error = new HashMap<>();

        error.put("timestamp", LocalDateTime.now());
        error.put("message", "Internal server error");
        error.put("status", 500);

        return ResponseEntity.status(500).body(error);
    }
}
