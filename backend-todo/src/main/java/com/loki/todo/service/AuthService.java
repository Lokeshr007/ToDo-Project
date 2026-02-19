package com.loki.todo.service;

import com.loki.todo.dto.AuthRequest;
import com.loki.todo.model.User;
import com.loki.todo.repository.UserRepository;

import com.loki.todo.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;


    // 🔥 OTP generator
    private String generateOtp() {
        return String.valueOf((int)(Math.random()*900000)+100000);
    }

    // ================= REGISTER =================

    public User register(AuthRequest req){

        if(repo.findByEmail(req.getEmail()).isPresent()){
            throw new RuntimeException("Email already exists");
        }

        User user = new User();

        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));

        String otp = generateOtp();

        user.setOtp(otp);
        user.setVerified(false);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        repo.save(user);

        // send email AFTER save
        emailService.sendOtp(user.getEmail(), otp);
        return user;
    }



    // ================= VERIFY REGISTER OTP =================

    public String verifyOtp(String email,String otp){

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!otp.equals(user.getOtp())){
            throw new RuntimeException("Invalid OTP");
        }

        if(user.getOtpExpiry().isBefore(LocalDateTime.now())){
            throw new RuntimeException("OTP expired");
        }

        user.setVerified(true);
        user.setOtp(null);

        repo.save(user);

        return "Account verified";
    }


    // ================= LOGIN =================

    public Map<String,String> login(AuthRequest req){

        User user = repo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 🚨 must verify email first
        if(!user.isVerified()){
            throw new RuntimeException("Verify email first");
        }

        // 🔥 CORRECT PASSWORD CHECK
        if(!encoder.matches(req.getPassword(), user.getPassword())){
            throw new RuntimeException("Invalid password");
        }

        String accessToken =
                jwtUtil.generateAccessToken(user.getEmail());

        String refreshToken =
                jwtUtil.generateRefreshToken(user.getEmail());

        return Map.of(
                "accessToken", accessToken,
                "refreshToken", refreshToken
        );
    }


    // ================= FORGOT PASSWORD SEND OTP =================

    public void sendForgotPasswordOtp(String email){

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = generateOtp();

        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        repo.save(user);

        emailService.sendOtp(email, otp);
    }


    // ================= VERIFY FORGOT OTP =================

    public void verifyForgotOtp(String email,String otp){

        User user = repo.findByEmail(email).orElseThrow();

        if(!otp.equals(user.getOtp()))
            throw new RuntimeException("Invalid OTP");

        if(user.getOtpExpiry().isBefore(LocalDateTime.now()))
            throw new RuntimeException("OTP expired");
    }


    // ================= RESET PASSWORD =================

    public void resetPassword(String email,String newPassword){

        User user = repo.findByEmail(email).orElseThrow();

        user.setPassword(encoder.encode(newPassword));

        repo.save(user);
    }

    public User handleGoogleLogin(String email) {
        return repo.findByEmail(email)
                .orElseGet(() -> {

                    User newUser = new User();

                    newUser.setEmail(email);
                    newUser.setVerified(true); // google already verified
                    newUser.setProvider("GOOGLE");

                    return repo.save(newUser);
                });
    }
}
