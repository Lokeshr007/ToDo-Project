package com.loki.todo.controller;

import com.loki.todo.dto.AuthRequest;
import com.loki.todo.model.RefreshToken;
import com.loki.todo.model.User;
import com.loki.todo.model.Membership;
import com.loki.todo.repository.RefreshTokenRepository;
import com.loki.todo.repository.MembershipRepository;
import com.loki.todo.security.JwtUtil;
import com.loki.todo.service.AuthService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final RefreshTokenRepository refreshTokenRepository;
    private final MembershipRepository membershipRepository;

    public AuthController(
            AuthService authService,
            JwtUtil jwtUtil,
            RefreshTokenRepository refreshTokenRepository,
            MembershipRepository membershipRepository) {

        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.refreshTokenRepository = refreshTokenRepository;
        this.membershipRepository = membershipRepository;
    }

    private ResponseCookie createRefreshCookie(String token) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .sameSite("Lax")
                .maxAge(7 * 24 * 60 * 60) // 7 days
                .build();
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req) {
        try {
            authService.register(req);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OTP sent to email");
            response.put("success", true);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            error.put("success", false);
            return ResponseEntity.badRequest().body(error);
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Email and OTP are required");
            error.put("success", false);
            return ResponseEntity.badRequest().body(error);
        }

        Map<String, Object> result = authService.verifyOtp(email, otp);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody AuthRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse response) {

        try {
            Map<String, Object> tokens = authService.login(request, httpRequest);

            String accessToken = (String) tokens.get("accessToken");
            String refreshToken = (String) tokens.get("refreshToken");
            User user = (User) tokens.get("user");

            ResponseCookie cookie = createRefreshCookie(refreshToken);
            response.addHeader("Set-Cookie", cookie.toString());

            // Get user's workspaces
            List<Membership> memberships = membershipRepository.findByUser(user);

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", user.getId());
            userMap.put("email", user.getEmail());
            userMap.put("name", user.getName() != null ? user.getName() : user.getEmail().split("@")[0]);

            java.util.List<Map<String, Object>> workspaceList = new java.util.ArrayList<>();
            for (Membership m : memberships) {
                Map<String, Object> ws = new HashMap<>();
                ws.put("id", m.getWorkspace().getId());
                ws.put("name", m.getWorkspace().getName());
                workspaceList.add(ws);
            }

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("accessToken", accessToken);
            responseBody.put("user", userMap);
            responseBody.put("workspaces", workspaceList);
            responseBody.put("success", true);

            return ResponseEntity.ok(responseBody);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            error.put("success", false);
            return ResponseEntity.status(401).body(error);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(
            @CookieValue(name = "refreshToken", required = false) String token,
            HttpServletResponse response) {

        if (token == null) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Missing refresh token");
            error.put("success", false);
            return ResponseEntity.status(401).body(error);
        }

        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (refreshToken.isRevoked()) {
            refreshTokenRepository.deleteByDeviceSession(refreshToken.getDeviceSession());
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Session compromised");
            error.put("success", false);
            return ResponseEntity.status(403).body(error);
        }

        if (refreshToken.getExpiry().isBefore(LocalDateTime.now())) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Refresh token expired");
            error.put("success", false);
            return ResponseEntity.status(401).body(error);
        }

        User user = refreshToken.getUser();

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        String newRefreshToken = authService.createRefreshToken(user, refreshToken.getDeviceSession());

        Membership membership = membershipRepository.findFirstByUser(user)
                .orElseThrow(() -> new RuntimeException("No workspace found"));

        Long workspaceId = membership.getWorkspace().getId();

        String newAccessToken = jwtUtil.generateAccessToken(user.getEmail(), workspaceId, refreshToken.getDeviceSession().getId());

        ResponseCookie cookie = createRefreshCookie(newRefreshToken);
        response.addHeader("Set-Cookie", cookie.toString());

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("accessToken", newAccessToken);
        responseBody.put("success", true);

        return ResponseEntity.ok(responseBody);
    }

    @GetMapping("/google-success")
    public void googleSuccess(
            Authentication authentication,
            HttpServletResponse response,
            HttpServletRequest request) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();
        String email = oauthUser.getAttribute("email");
        String name = oauthUser.getAttribute("name");

        Map<String, Object> tokens = authService.googleLogin(email, name, request);

        String accessToken = (String) tokens.get("accessToken");
        String refreshToken = (String) tokens.get("refreshToken");

        ResponseCookie cookie = createRefreshCookie(refreshToken);
        response.addHeader("Set-Cookie", cookie.toString());

        // Redirect to frontend with token and user info
        String redirectUrl = "http://localhost:5173/google-success?token=" + accessToken +
                "&email=" + email +
                "&name=" + (name != null ? name.replace(" ", "%20") : "");

        response.sendRedirect(redirectUrl);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "Not authenticated");
            error.put("success", false);
            return ResponseEntity.status(401).body(error);
        }

        String email = authentication.getName();
        User user = authService.getUserByEmail(email);

        List<Membership> memberships = membershipRepository.findByUser(user);

        Map<String, Object> userMap = new HashMap<>();
        userMap.put("id", user.getId());
        userMap.put("email", user.getEmail());
        userMap.put("name", user.getName() != null ? user.getName() : user.getEmail().split("@")[0]);

        java.util.List<Map<String, Object>> workspaceList = new java.util.ArrayList<>();
        for (Membership m : memberships) {
            Map<String, Object> ws = new HashMap<>();
            ws.put("id", m.getWorkspace().getId());
            ws.put("name", m.getWorkspace().getName());
            workspaceList.add(ws);
        }

        userMap.put("workspaces", workspaceList);

        return ResponseEntity.ok(userMap);
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getMySessions(Authentication authentication) {
        return ResponseEntity.ok(
                authService.getActiveSessions(authentication.getName())
        );
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<?> revokeSession(
            @PathVariable Long id,
            Authentication authentication) {

        authService.revokeSession(id, authentication.getName());

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Session revoked");
        response.put("success", true);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login-otp/send")
    public ResponseEntity<?> sendLoginOtp(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            authService.sendLoginOtp(email);
            return ResponseEntity.ok(Map.of("message", "OTP sent successfully", "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/forgot-password-send")
    public ResponseEntity<?> sendForgotPasswordOtp(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            authService.sendForgotPasswordOtp(email);
            return ResponseEntity.ok(Map.of("message", "Reset OTP sent successfully", "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/forgot-password-verify")
    public ResponseEntity<?> verifyForgotPasswordOtp(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String otp = body.get("otp");
            authService.verifyForgotPasswordOtp(email, otp);
            return ResponseEntity.ok(Map.of("message", "OTP verified successfully", "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String newPassword = body.get("newPassword");
            authService.resetPassword(email, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password reset successfully", "success", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @CookieValue(name = "refreshToken", required = false) String token,
            HttpServletResponse response) {

        if (token != null) {
            refreshTokenRepository.findByToken(token).ifPresent(refreshToken -> {
                refreshToken.setRevoked(true);
                refreshTokenRepository.save(refreshToken);
            });
        }

        // Clear the cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .build();
        response.addHeader("Set-Cookie", cookie.toString());

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("message", "Logged out successfully");
        responseBody.put("success", true);

        return ResponseEntity.ok(responseBody);
    }
}