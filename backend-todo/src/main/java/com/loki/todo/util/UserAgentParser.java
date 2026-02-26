package com.loki.todo.util;

import org.springframework.stereotype.Component;
import jakarta.servlet.http.HttpServletRequest;
import java.util.regex.Pattern;

@Component
public class UserAgentParser {

    public String parseDeviceName(String userAgent) {
        if (userAgent == null) return "Unknown Device";

        if (userAgent.contains("Mobile")) return "Mobile Device";
        if (userAgent.contains("Tablet")) return "Tablet";
        if (userAgent.contains("Mac")) return "Mac";
        if (userAgent.contains("Windows")) return "Windows PC";
        if (userAgent.contains("Linux")) return "Linux Device";

        return "Computer";
    }

    public String parseDeviceType(String userAgent) {
        if (userAgent == null) return "DESKTOP";

        if (userAgent.contains("Mobile")) return "MOBILE";
        if (userAgent.contains("Tablet")) return "TABLET";
        return "DESKTOP";
    }

    public String parseBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";

        if (userAgent.contains("Chrome") && !userAgent.contains("Edg")) return "Chrome";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Safari") && !userAgent.contains("Chrome")) return "Safari";
        if (userAgent.contains("Edg")) return "Edge";
        if (userAgent.contains("OPR") || userAgent.contains("Opera")) return "Opera";

        return "Unknown";
    }

    public String parseOS(String userAgent) {
        if (userAgent == null) return "Unknown";

        if (userAgent.contains("Windows NT 10.0")) return "Windows 10";
        if (userAgent.contains("Windows NT 11.0")) return "Windows 11";
        if (userAgent.contains("Mac OS X")) return "macOS";
        if (userAgent.contains("Linux")) return "Linux";
        if (userAgent.contains("Android")) return "Android";
        if (userAgent.contains("iOS") || userAgent.contains("iPhone") || userAgent.contains("iPad")) return "iOS";

        return "Unknown";
    }

    public String getLocationFromIp(String ipAddress) {
        // This would integrate with a geolocation service
        // For now, return a placeholder
        return "Unknown Location";
    }
}