package com.example.smart_campus_operation_hub.controller;

import com.example.smart_campus_operation_hub.dto.request.NotificationPrefRequest;
import com.example.smart_campus_operation_hub.dto.response.NotificationPreferenceResponse;
import com.example.smart_campus_operation_hub.dto.response.NotificationResponse;
import com.example.smart_campus_operation_hub.service.NotificationService;
import com.example.smart_campus_operation_hub.util.ApiResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

/**
 * MEMBER 4: Notification Controller
 * Base path: /api/v1/notifications
 */
@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Object>> getNotifications(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            Principal principal,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Long userId = resolveUserId(headerUserId, principal);
        Page<NotificationResponse> notifications = notificationService.getUserNotifications(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Object>> getUnreadCount(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            Principal principal) {

        Long userId = resolveUserId(headerUserId, principal);
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Object>> markAsRead(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            Principal principal) {

        Long userId = resolveUserId(headerUserId, principal);
        NotificationResponse response = notificationService.markAsRead(id, userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Object>> markAllAsRead(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            Principal principal) {

        Long userId = resolveUserId(headerUserId, principal);
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteNotification(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            Principal principal) {

        Long userId = resolveUserId(headerUserId, principal);
        notificationService.deleteNotification(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<Object>> getPreferences(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            Principal principal) {

        Long userId = resolveUserId(headerUserId, principal);
        NotificationPreferenceResponse response = notificationService.getPreferences(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<Object>> updatePreferences(
            @RequestHeader(value = "X-User-Id", required = false) Long headerUserId,
            Principal principal,
            @RequestBody NotificationPrefRequest request) {

        Long userId = resolveUserId(headerUserId, principal);
        NotificationPreferenceResponse response = notificationService.updatePreferences(userId, request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private Long resolveUserId(Long headerUserId, Principal principal) {
        if (headerUserId != null) {
            return headerUserId;
        }
        if (principal != null) {
            try {
                return Long.parseLong(principal.getName());
            } catch (NumberFormatException ignored) {
            }
        }
        return 1L;
    }
}
