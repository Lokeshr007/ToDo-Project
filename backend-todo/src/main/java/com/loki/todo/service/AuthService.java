package com.loki.todo.service;

import com.loki.todo.dto.AuthRequest;
import com.loki.todo.model.*;
import com.loki.todo.repository.*;
import com.loki.todo.security.JwtUtil;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private DeviceSessionRepository deviceRepo;

    @Autowired
    private RefreshTokenRepository refreshRepo;

    @Autowired
    private WorkspaceRepository workspaceRepo;

    @Autowired
    private MembershipRepository membershipRepo;

    @Autowired
    private EmailService emailService;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private JwtUtil jwtUtil;

    private String generateOtp() {
        return String.valueOf((int)(Math.random()*900000)+100000);
    }

    public User register(AuthRequest req){

        if(userRepo.findByEmail(req.getEmail()).isPresent())
            throw new RuntimeException("Email already exists");

        User user = new User();
        user.setName(req.getName() != null ? req.getName() : req.getEmail().split("@")[0]);
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setVerified(false);

        String otp = generateOtp();

        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));

        User savedUser = userRepo.save(user);

        Workspace workspace = new Workspace();
        workspace.setName(savedUser.getName() + "'s Workspace");
        workspace.setOwner(savedUser);
        workspaceRepo.save(workspace);

        Membership membership = new Membership();
        membership.setUser(savedUser);
        membership.setWorkspace(workspace);
        membership.setRole(Membership.Role.ADMIN);
        membershipRepo.save(membership);

        emailService.sendOtp(savedUser.getEmail(), otp);

        return savedUser;
    }

    public Map<String, Object> verifyOtp(String email, String otp){

        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!otp.equals(user.getOtp()))
            throw new RuntimeException("Invalid OTP");

        if(user.getOtpExpiry().isBefore(LocalDateTime.now()))
            throw new RuntimeException("OTP expired");

        user.setVerified(true);
        user.setOtp(null);
        user.setOtpExpiry(null);

        userRepo.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Account verified");
        response.put("success", true);

        return response;
    }

    public Map<String,Object> login(AuthRequest req, HttpServletRequest request){

        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if(!user.isVerified())
            throw new RuntimeException("Verify email first");

        if(!encoder.matches(req.getPassword(), user.getPassword()))
            throw new RuntimeException("Invalid password");

        DeviceSession device = createDeviceSession(user, request);

        Membership membership =
                membershipRepo.findFirstByUser(user)
                        .orElseThrow(() -> new RuntimeException("Workspace missing"));

        Long workspaceId = membership.getWorkspace().getId();

        String accessToken =
                jwtUtil.generateAccessToken(user.getEmail(), workspaceId, device.getId());

        String refreshToken =
                createRefreshToken(user, device);

        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        result.put("user", user);

        return result;
    }

    public Map<String,Object> googleLogin(String email, String name, HttpServletRequest request){

        User user = userRepo.findByEmail(email)
                .orElseGet(() -> {

                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setName(name != null ? name : email.split("@")[0]);
                    newUser.setVerified(true);

                    User savedUser = userRepo.save(newUser);

                    Workspace workspace = new Workspace();
                    workspace.setName(savedUser.getName() + "'s Workspace");
                    workspace.setOwner(savedUser);
                    workspaceRepo.save(workspace);

                    Membership membership = new Membership();
                    membership.setUser(savedUser);
                    membership.setWorkspace(workspace);
                    membership.setRole(Membership.Role.ADMIN);
                    membershipRepo.save(membership);

                    return savedUser;
                });

        DeviceSession device = createDeviceSession(user, request);

        Membership membership =
                membershipRepo.findFirstByUser(user)
                        .orElseThrow(() -> new RuntimeException("Workspace missing"));

        Long workspaceId = membership.getWorkspace().getId();

        String accessToken =
                jwtUtil.generateAccessToken(user.getEmail(), workspaceId, device.getId());

        String refreshToken =
                createRefreshToken(user, device);

        Map<String, Object> result = new HashMap<>();
        result.put("accessToken", accessToken);
        result.put("refreshToken", refreshToken);
        result.put("user", user);

        return result;
    }

    public User getUserByEmail(String email) {
        return userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private DeviceSession createDeviceSession(User user, HttpServletRequest request){

        DeviceSession device = new DeviceSession();

        String ua = request.getHeader("User-Agent");

        device.setUser(user);
        device.setDeviceName(parseDevice(ua));
        device.setUserAgent(ua);
        device.setIpAddress(request.getRemoteAddr());
        device.setCreatedAt(LocalDateTime.now());
        device.setActive(true);

        return deviceRepo.save(device);
    }

    public String createRefreshToken(User user, DeviceSession device){

        String token = UUID.randomUUID().toString();

        RefreshToken refresh = new RefreshToken();
        refresh.setToken(token);
        refresh.setUser(user);
        refresh.setDeviceSession(device);
        refresh.setExpiry(LocalDateTime.now().plusDays(7));
        refresh.setRevoked(false);

        refreshRepo.save(refresh);

        return token;
    }

    public List<DeviceSession> getActiveSessions(String email){

        User user = userRepo.findByEmail(email).orElseThrow();

        return deviceRepo.findByUserAndActiveTrue(user);
    }

    public void revokeSession(Long id, String email){

        DeviceSession session =
                deviceRepo.findById(id).orElseThrow();

        if(!session.getUser().getEmail().equals(email))
            throw new RuntimeException("Unauthorized");

        session.setActive(false);
        deviceRepo.save(session);

        refreshRepo.deleteByDeviceSession(session);
    }

    private String parseDevice(String userAgent){

        if(userAgent == null) return "Unknown Device";

        if(userAgent.contains("Windows")) return "Windows Device";
        if(userAgent.contains("Mac")) return "Mac Device";
        if(userAgent.contains("Android")) return "Android Device";
        if(userAgent.contains("iPhone")) return "iPhone";

        return "Browser Device";
    }

    public void sendLoginOtp(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(5));
        userRepo.save(user);

        emailService.sendOtp(email, otp);
    }

    public void sendForgotPasswordOtp(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String otp = generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(15));
        userRepo.save(user);

        emailService.sendOtp(email, otp);
    }

    public void verifyForgotPasswordOtp(String email, String otp) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!otp.equals(user.getOtp())) {
            throw new RuntimeException("Invalid OTP");
        }

        if (user.getOtpExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        // Keep OTP for reset password step, maybe set a flag or just leave it until reset
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(encoder.encode(newPassword));
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepo.save(user);
    }
}