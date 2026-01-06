package com.aihelper; // Giữ nguyên tên package này

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
@RestController // <--- Thêm dòng này: Biến file này thành nơi xử lý API luôn
@CrossOrigin(origins = "*") // <--- Thêm dòng này: Cho phép Frontend gọi vào thoải mái
public class AiHelperApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiHelperApplication.class, args);
    }

    // 👇 API health check nằm ngay tại đây, không thể nào lạc đi đâu được
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "Backend is running directly from Main!");
        return ResponseEntity.ok(response);
    }

    // 👇 API trang chủ
    @GetMapping("/")
    public String home() {
        return "Backend is working!";
    }
}