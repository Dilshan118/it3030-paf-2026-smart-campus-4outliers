package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.UserService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * MEMBER 4: User Controller
 * Base path: /api/v1/users (user) and /api/v1/admin/users (admin)
 *
 * TODO: Implement profile and admin user management endpoints
 */
@RestController
@RequestMapping("/api/v1")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // TODO: GET    /users/me               → Get current user profile
    // TODO: PUT    /users/me               → Update profile
    // TODO: GET    /admin/users            → List all users (Admin)
    // TODO: PATCH  /admin/users/{id}/role  → Change user role (Admin)
}
