package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.enums.NotificationType;
import com.example.smart_campus_operation_hub.repository.NotificationRepository;
import org.springframework.stereotype.Service;

/**
 * MEMBER 4: Notification Service
 *
 * Other services call this to create notifications. For example:
 *   notificationService.send(userId, NotificationType.BOOKING_APPROVED, "Booking approved", "...", bookingId, "BOOKING");
 *
 * TODO: Implement notification CRUD, preferences check, WebSocket push
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    // TODO: send(Long userId, NotificationType type, String title, String message, Long refId, String refType)
    // TODO: getUserNotifications(Long userId, Pageable pageable)
    // TODO: getUnreadCount(Long userId)
    // TODO: markAsRead(Long notificationId)
    // TODO: markAllAsRead(Long userId)
    // TODO: deleteNotification(Long notificationId)
    // TODO: getPreferences(Long userId)
    // TODO: updatePreferences(Long userId, NotificationPrefRequest request)
}
