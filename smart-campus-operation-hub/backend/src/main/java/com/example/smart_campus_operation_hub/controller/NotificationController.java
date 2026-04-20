package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.dto.request.NotificationPrefRequest;
import com.example.smart_campus_operation_hub.dto.response.NotificationPreferenceResponse;
import com.example.smart_campus_operation_hub.dto.response.NotificationResponse;
import com.example.smart_campus_operation_hub.service.NotificationService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getNotifications(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = (Long) authentication.getPrincipal();
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Object>> getUnreadCount(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Object>> markAsRead(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId = (Long) authentication.getPrincipal();
        NotificationResponse response = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Object>> markAllAsRead(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteNotification(
            Authentication authentication,
            @PathVariable Long id) {

        Long userId = (Long) authentication.getPrincipal();
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<Object>> getPreferences(Authentication authentication) {
        Long userId = (Long) authentication.getPrincipal();
        NotificationPreferenceResponse response = notificationService.getPreferences(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<Object>> updatePreferences(
            Authentication authentication,
            @RequestBody NotificationPrefRequest request) {

        Long userId = (Long) authentication.getPrincipal();
        NotificationPreferenceResponse response = notificationService.updatePreferences(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
