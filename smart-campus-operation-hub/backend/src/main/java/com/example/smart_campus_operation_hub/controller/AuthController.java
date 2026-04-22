package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.service.UserService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> getCurrentUser(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Object>> logout() {
        return ResponseEntity.ok(ApiResponse.success(null, "Logged out successfully"));
    }
}
