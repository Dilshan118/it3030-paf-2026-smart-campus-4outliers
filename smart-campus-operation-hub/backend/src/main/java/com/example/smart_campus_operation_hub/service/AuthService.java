package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.enums.NotificationType;
import com.example.smart_campus_operation_hub.enums.Role;
import com.example.smart_campus_operation_hub.exception.PendingApprovalException;
import com.example.smart_campus_operation_hub.exception.UnauthorizedException;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import com.example.smart_campus_operation_hub.security.JwtTokenProvider;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       JwtTokenProvider jwtTokenProvider,
                       @Lazy NotificationService notificationService) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.notificationService = notificationService;
    }

    public String handleOAuth2Login(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("picture");
        String providerId = oAuth2User.getAttribute("sub");

        boolean isNewUser = !userRepository.existsByEmail(email);
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, name, avatarUrl, providerId));

        if (isNewUser) {
            try {
                notifyAdminsOfNewRequest(user);
            } catch (Exception e) {
                System.err.println("[AuthService] Failed to notify admins of new registration: " + e.getMessage());
            }
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            if (user.getRole() == Role.ADMIN) {
                user.setIsActive(true);
                user = userRepository.save(user);
            } else if (user.getRejectedAt() != null) {
                throw new UnauthorizedException("Your access request was declined. Please contact an administrator.");
            } else {
                throw new PendingApprovalException("Your account is awaiting admin approval.");
            }
        }

        if (avatarUrl != null && !avatarUrl.equals(user.getAvatarUrl())) {
            user.setAvatarUrl(avatarUrl);
            user = userRepository.save(user);
        }

        return jwtTokenProvider.generateToken(user);
    }

    private User createNewUser(String email, String name, String avatarUrl, String providerId) {
        User user = new User();
        user.setEmail(email);
        user.setName(name != null ? name : email);
        user.setAvatarUrl(avatarUrl);
        user.setProvider("google");
        user.setProviderId(providerId);
        return userRepository.save(user);
    }

    private void notifyAdminsOfNewRequest(User newUser) {
        List<User> admins = userRepository.findByRoleAndIsActiveTrue(Role.ADMIN);
        System.out.println("[AuthService] New registration from " + newUser.getEmail() + " — found " + admins.size() + " admin(s) to notify");
        for (User admin : admins) {
            System.out.println("[AuthService] Notifying admin: " + admin.getEmail() + " (id=" + admin.getId() + ")");
            try {
                notificationService.send(
                        admin.getId(),
                        NotificationType.USER_APPROVAL_REQUEST,
                        "New Access Request",
                        newUser.getName() + " (" + newUser.getEmail() + ") has requested access to the platform.",
                        newUser.getId(),
                        "USER"
                );
                System.out.println("[AuthService] Notification saved for: " + admin.getEmail());
            } catch (Exception e) {
                System.err.println("[AuthService] Failed in-app notification for " + admin.getEmail() + ": " + e.getMessage());
            }
        }
    }
}
