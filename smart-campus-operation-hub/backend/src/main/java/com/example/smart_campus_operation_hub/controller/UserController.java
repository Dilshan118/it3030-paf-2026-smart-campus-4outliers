package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.enums.Role;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.service.UserService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * MEMBER 4: User Controller
 * Base path: /api/v1/users (user) and /api/v1/admin/users (admin)
 */
@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/me")
    public ResponseEntity<ApiResponse<Object>> getCurrentUser() {
        Long userId = 1L; // TODO: get from principal
        User user = userService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/users/me")
    public ResponseEntity<ApiResponse<Object>> updateProfile(@RequestBody Map<String, Object> updates) {
        Long userId = 1L; // TODO: get from principal
        User user = userService.updateProfile(userId, updates);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/admin/users")
    public ResponseEntity<ApiResponse<Object>> getAllUsers(Pageable pageable) {
        Page<User> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/admin/users/{id}/role")
    public ResponseEntity<ApiResponse<Object>> changeUserRole(@PathVariable Long id, @RequestParam Role role) {
        User user = userService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success(user));
    }
}
