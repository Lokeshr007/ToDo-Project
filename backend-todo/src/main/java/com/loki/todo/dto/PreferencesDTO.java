package com.loki.todo.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class PreferencesDTO {
    private Boolean compactView = false;
    private Boolean showWeekNumbers = true;
    private Boolean startWeekOnMonday = true;
    private Boolean autoSave = true;
    private Boolean soundEnabled = true;
    private Boolean desktopNotifications = true;
    private String theme = "light";
    private String language = "en";
    private String timezone = "UTC";

    public static PreferencesDTO fromMap(Map<String, Object> map) {
        PreferencesDTO dto = new PreferencesDTO();

        if (map.containsKey("compactView")) {
            dto.setCompactView(Boolean.valueOf(String.valueOf(map.get("compactView"))));
        }
        if (map.containsKey("showWeekNumbers")) {
            dto.setShowWeekNumbers(Boolean.valueOf(String.valueOf(map.get("showWeekNumbers"))));
        }
        if (map.containsKey("startWeekOnMonday")) {
            dto.setStartWeekOnMonday(Boolean.valueOf(String.valueOf(map.get("startWeekOnMonday"))));
        }
        if (map.containsKey("autoSave")) {
            dto.setAutoSave(Boolean.valueOf(String.valueOf(map.get("autoSave"))));
        }
        if (map.containsKey("soundEnabled")) {
            dto.setSoundEnabled(Boolean.valueOf(String.valueOf(map.get("soundEnabled"))));
        }
        if (map.containsKey("desktopNotifications")) {
            dto.setDesktopNotifications(Boolean.valueOf(String.valueOf(map.get("desktopNotifications"))));
        }
        if (map.containsKey("theme")) {
            dto.setTheme(String.valueOf(map.get("theme")));
        }
        if (map.containsKey("language")) {
            dto.setLanguage(String.valueOf(map.get("language")));
        }
        if (map.containsKey("timezone")) {
            dto.setTimezone(String.valueOf(map.get("timezone")));
        }

        return dto;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("compactView", compactView);
        map.put("showWeekNumbers", showWeekNumbers);
        map.put("startWeekOnMonday", startWeekOnMonday);
        map.put("autoSave", autoSave);
        map.put("soundEnabled", soundEnabled);
        map.put("desktopNotifications", desktopNotifications);
        map.put("theme", theme);
        map.put("language", language);
        map.put("timezone", timezone);
        return map;
    }
}