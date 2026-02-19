package com.loki.todo.controller;

import com.loki.todo.dto.AuthRequest;
import com.loki.todo.model.User;
import com.loki.todo.repository.UserRepository;
import com.loki.todo.security.JwtUtil;
import com.loki.todo.service.AuthService;

import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository repo;

    @Autowired
    private AuthService ser;

    @Autowired
    private JwtUtil jwtUtil;


    // ================= REGISTER =================

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AuthRequest req){

        User user = ser.register(req);

        return ResponseEntity.ok("OTP sent to email. Please verify.");
    }


    // ================= VERIFY REGISTER OTP =================

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String,String> body){

        String message =
                ser.verifyOtp(body.get("email"), body.get("otp"));

        return ResponseEntity.ok(message);
    }


    // ================= LOGIN (EMAIL + PASSWORD ONLY) =================

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request){

        Map<String,String> tokens = ser.login(request);

        return ResponseEntity.ok(tokens);
    }


    // ================= REFRESH TOKEN =================

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String,String> body){

        String refreshToken = body.get("refreshToken");

        if(refreshToken == null || refreshToken.isBlank()){
            return  ResponseEntity.status(401)
                    .body("Refresh Token Missing");
        }



        String username = jwtUtil.extractUsername(refreshToken);


        String newAccessToken = jwtUtil.generateAccessToken(username);

        return ResponseEntity.ok(
                Map.of("accessToken",newAccessToken)
        );
    }


    // ================= GOOGLE LOGIN =================

    @GetMapping("/google-success")
    public void googleSuccess(
            Authentication authentication,
            HttpServletResponse response) throws IOException {

        OAuth2User oauthUser = (OAuth2User) authentication.getPrincipal();

        String email = oauthUser.getAttribute("email");

        // 🔥 THIS IS THE IMPORTANT PART
        User user = ser.handleGoogleLogin(email);

        String accessToken =
                jwtUtil.generateAccessToken(user.getEmail());

        String refreshToken =
                jwtUtil.generateRefreshToken(user.getEmail());

        response.sendRedirect(
                "http://localhost:5173/google-success?token=" + accessToken
                        + "&refresh=" + refreshToken
        );
    }



    // ================= FORGOT PASSWORD SEND OTP =================

    @PostMapping("/forgot-password-send")
    public ResponseEntity<?> forgotPasswordSend(@RequestBody Map<String,String> body){

        ser.sendForgotPasswordOtp(body.get("email"));

        return ResponseEntity.ok("OTP sent");
    }


    // ================= VERIFY FORGOT OTP =================

    @PostMapping("/forgot-password-verify")
    public ResponseEntity<?> verifyForgotOtp(@RequestBody Map<String,String> body){

        ser.verifyForgotOtp(body.get("email"), body.get("otp"));

        return ResponseEntity.ok("OTP verified");
    }


    // ================= RESET PASSWORD =================

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String,String> body){

        ser.resetPassword(
                body.get("email"),
                body.get("newPassword")
        );

        return ResponseEntity.ok("Password updated");
    }
}
