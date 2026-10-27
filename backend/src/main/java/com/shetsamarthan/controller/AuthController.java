package com.shetsamarthan.controller;

import com.shetsamarthan.model.User;
import com.shetsamarthan.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> status = new HashMap<>();
        status.put("status", "UP");
        status.put("platform", "शेत समर्थन (Shet Samarthan)");
        status.put("service", "Spring Boot Primary Agriculture REST API");
        status.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(status);
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String email = credentials.get("email");
        String password = credentials.get("password");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Validate password or allow demo password
            Map<String, Object> response = new HashMap<>();
            response.put("token", "dummy-jwt-token-shetsamarthan-" + user.getId());
            response.put("user", user);
            return ResponseEntity.ok(response);
        }

        // Auto-create for demo convenience if user not found
        User newUser = User.builder()
                .fullName("Ramesh Patil")
                .fullNameMr("रमेश पाटील")
                .email(email)
                .password(passwordEncoder.encode(password))
                .phone("+91 98220 12345")
                .location("Pune, Maharashtra")
                .village("Haveli")
                .district("Pune")
                .farmArea(2.4)
                .primaryCrop("Tomato & Sugarcane")
                .soilType("Black Soil (Regur)")
                .build();
        userRepository.save(newUser);

        Map<String, Object> response = new HashMap<>();
        response.put("token", "dummy-jwt-token-shetsamarthan-" + newUser.getId());
        response.put("user", newUser);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already registered."));
        }
        user.setPassword(passwordEncoder.encode(user.getPassword() != null ? user.getPassword() : "Farmer@123"));
        User saved = userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("token", "dummy-jwt-token-shetsamarthan-" + saved.getId());
        response.put("user", saved);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/auth/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String otp = request.get("otp");
        if (phone == null || phone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Phone number is required."));
        }
        if (otp == null || otp.isBlank()) {
            otp = String.valueOf((int) (100000 + Math.random() * 900000));
        }

        String fast2SmsKey = System.getenv("FAST2SMS_API_KEY");
        if (fast2SmsKey == null || fast2SmsKey.isBlank()) {
            fast2SmsKey = "p3dpa2AV7YrnxcOTilWe6dFPwn651GBpHPM4mvrYBO8ply5UU4CnEw9mZ3Ht";
        }

        try {
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            String payload = String.format("{\"route\":\"otp\",\"variables_values\":\"%s\",\"numbers\":\"%s\"}", otp, phone);

            java.net.http.HttpRequest httpRequest = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create("https://www.fast2sms.com/dev/bulkV2"))
                    .header("authorization", fast2SmsKey)
                    .header("Content-Type", "application/json")
                    .POST(java.net.http.HttpRequest.BodyPublishers.ofString(payload))
                    .build();

            java.net.http.HttpResponse<String> httpResponse = client.send(httpRequest, java.net.http.HttpResponse.BodyHandlers.ofString());

            Map<String, Object> resMap = new HashMap<>();
            resMap.put("success", httpResponse.statusCode() == 200);
            resMap.put("otp", otp);
            resMap.put("responseBody", httpResponse.body());
            return ResponseEntity.ok(resMap);
        } catch (Exception e) {
            Map<String, Object> errMap = new HashMap<>();
            errMap.put("success", false);
            errMap.put("otp", otp);
            errMap.put("error", e.getMessage());
            return ResponseEntity.ok(errMap);
        }
    }
}
