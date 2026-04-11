package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.service.NotificationService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * MEMBER 4: Notification Controller
 * Base path: /api/v1/notifications
 *
 * TODO: Implement notification CRUD and preferences
 */
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    // TODO: GET    /                 → List user notifications (paginated)
    // TODO: GET    /unread-count     → Get unread count
    // TODO: PATCH  /{id}/read        → Mark one as read
    // TODO: PATCH  /read-all         → Mark all as read
    // TODO: DELETE /{id}             → Delete notification
    // TODO: GET    /preferences      → Get notification preferences
    // TODO: PUT    /preferences      → Update preferences
}
