package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.AuthService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * MEMBER 4: Auth Controller
 * Base path: /api/v1/auth
 *
 * TODO: Implement OAuth2 login flow and JWT management
 */
@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // TODO: GET    /login      → Redirect to Google OAuth2
    // TODO: GET    /callback   → Handle Google callback, return JWT
    // TODO: POST   /refresh    → Refresh JWT token
    // TODO: POST   /logout     → Invalidate session
}
