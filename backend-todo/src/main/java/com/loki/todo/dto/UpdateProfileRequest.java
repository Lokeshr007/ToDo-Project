package com.loki.todo.dto;

import lombok.Data;
import java.util.Map;

@Data
public class UpdateProfileRequest {
    private String name;
    private String bio;
    private String phone;
    private String location;
    private String company;
    private String jobTitle;
    private String themePreference;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private String timezone;
    private String language;
    private Map<String, Object> socialLinks;
    private Map<String, Object> preferences;
}