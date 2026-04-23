package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.enums.Role;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.service.UserService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users/me")
    public ResponseEntity<ApiResponse<Object>> getCurrentUser(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userService.getCurrentUser(userId);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @PutMapping("/users/me")
    public ResponseEntity<ApiResponse<Object>> updateProfile(Authentication authentication,
                                                              @RequestBody Map<String, Object> updates) {
        Long userId = (Long) authentication.getPrincipal();
        User user = userService.updateProfile(userId, updates);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @GetMapping("/users/technicians")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<ApiResponse<Object>> getTechnicians() {
        return ResponseEntity.ok(ApiResponse.success(userService.getTechnicians()));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getAllUsers(Pageable pageable) {
        Page<User> users = userService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @PatchMapping("/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> changeUserRole(@PathVariable Long id, @RequestParam Role role) {
        User user = userService.updateUserRole(id, role);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @DeleteMapping("/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> deleteUser(Authentication authentication,
                                                          @PathVariable Long id) {
        Long actorUserId = (Long) authentication.getPrincipal();
        User deactivatedUser = userService.deactivateUser(id, actorUserId);
        return ResponseEntity.ok(ApiResponse.success(deactivatedUser, "User deactivated successfully"));
    }

    @GetMapping("/admin/users/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> getPendingUsers(Pageable pageable) {
        Page<User> pending = userService.getPendingUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success(pending));
    }

    @PatchMapping("/admin/users/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> approveUser(@PathVariable Long id,
                                                           @RequestParam(required = false) Role role) {
        User approved = userService.approveUser(id, role);
        return ResponseEntity.ok(ApiResponse.success(approved, "User approved successfully"));
    }

    @PatchMapping("/admin/users/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Object>> rejectUser(@PathVariable Long id) {
        User rejected = userService.rejectUser(id);
        return ResponseEntity.ok(ApiResponse.success(rejected, "User rejected"));
    }
}
