package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.request.NotificationPrefRequest;
import com.example.smart_campus_operation_hub.dto.response.NotificationPreferenceResponse;
import com.example.smart_campus_operation_hub.dto.response.NotificationResponse;
import com.example.smart_campus_operation_hub.enums.NotificationType;
import com.example.smart_campus_operation_hub.exception.ResourceNotFoundException;
import com.example.smart_campus_operation_hub.model.Notification;
import com.example.smart_campus_operation_hub.model.NotificationPreference;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.NotificationPreferenceRepository;
import com.example.smart_campus_operation_hub.repository.NotificationRepository;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.Optional;

/**
 * MEMBER 4: Notification Service
 *
 * Other services call this to create notifications. For example:
 *   notificationService.send(userId, NotificationType.BOOKING_APPROVED, "Booking approved", "...", bookingId, "BOOKING");
 */
@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository,
                               NotificationPreferenceRepository preferenceRepository,
                               UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
    }

    public NotificationResponse send(Long userId, NotificationType type, String title, String message, Long refId, String refType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        NotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(user));

        if (!shouldDeliver(type, preference)) {
            return null;
        }

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setType(type);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setReferenceId(refId);
        notification.setReferenceType(refType);
        notification.setIsRead(false);

        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    public Page<NotificationResponse> getUserNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    public NotificationResponse markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new com.example.smart_campus_operation_hub.exception.UnauthorizedException("You can only update your own notifications");
        }

        notification.setIsRead(true);
        Notification saved = notificationRepository.save(notification);
        return mapToResponse(saved);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    public void deleteNotification(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new com.example.smart_campus_operation_hub.exception.UnauthorizedException("You can only delete your own notifications");
        }

        notificationRepository.delete(notification);
    }

    public NotificationPreferenceResponse getPreferences(Long userId) {
        NotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", userId))));

        return mapToResponse(preference);
    }

    public NotificationPreferenceResponse updatePreferences(Long userId, NotificationPrefRequest request) {
        NotificationPreference preference = preferenceRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultPreferences(userRepository.findById(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("User", userId))));

        if (request.getBookingEnabled() != null) {
            preference.setBookingEnabled(request.getBookingEnabled());
        }
        if (request.getTicketEnabled() != null) {
            preference.setTicketEnabled(request.getTicketEnabled());
        }
        if (request.getCommentEnabled() != null) {
            preference.setCommentEnabled(request.getCommentEnabled());
        }
        if (request.getEmailEnabled() != null) {
            preference.setEmailEnabled(request.getEmailEnabled());
        }
        if (request.getQuietHoursStart() != null) {
            preference.setQuietHoursStart(request.getQuietHoursStart());
        }
        if (request.getQuietHoursEnd() != null) {
            preference.setQuietHoursEnd(request.getQuietHoursEnd());
        }

        NotificationPreference saved = preferenceRepository.save(preference);
        return mapToResponse(saved);
    }

    private NotificationPreference createDefaultPreferences(User user) {
        NotificationPreference preference = new NotificationPreference();
        preference.setUser(user);
        preference.setBookingEnabled(true);
        preference.setTicketEnabled(true);
        preference.setCommentEnabled(true);
        preference.setEmailEnabled(false);
        return preferenceRepository.save(preference);
    }

    private boolean shouldDeliver(NotificationType type, NotificationPreference preference) {
        if (type.name().startsWith("BOOKING") && Boolean.FALSE.equals(preference.getBookingEnabled())) {
            return false;
        }
        if (type.name().startsWith("TICKET") && Boolean.FALSE.equals(preference.getTicketEnabled())) {
            return false;
        }
        if (type == NotificationType.COMMENT_ADDED && Boolean.FALSE.equals(preference.getCommentEnabled())) {
            return false;
        }
        return true;
    }

    private NotificationResponse mapToResponse(Notification notification) {
        NotificationResponse response = new NotificationResponse();
        response.setId(notification.getId());
        response.setType(notification.getType());
        response.setTitle(notification.getTitle());
        response.setMessage(notification.getMessage());
        response.setReferenceId(notification.getReferenceId());
        response.setReferenceType(notification.getReferenceType());
        response.setIsRead(notification.getIsRead());
        response.setCreatedAt(notification.getCreatedAt());
        return response;
    }

    private NotificationPreferenceResponse mapToResponse(NotificationPreference preference) {
        NotificationPreferenceResponse response = new NotificationPreferenceResponse();
        response.setBookingEnabled(preference.getBookingEnabled());
        response.setTicketEnabled(preference.getTicketEnabled());
        response.setCommentEnabled(preference.getCommentEnabled());
        response.setEmailEnabled(preference.getEmailEnabled());
        response.setQuietHoursStart(preference.getQuietHoursStart());
        response.setQuietHoursEnd(preference.getQuietHoursEnd());
        return response;
    }
}
