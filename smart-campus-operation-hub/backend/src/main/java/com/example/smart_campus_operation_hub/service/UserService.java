package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.enums.Role;
import com.example.smart_campus_operation_hub.exception.BadRequestException;
import com.example.smart_campus_operation_hub.exception.ResourceNotFoundException;
import com.example.smart_campus_operation_hub.exception.UnauthorizedException;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * MEMBER 4: User Service
 * TODO: Implement user profile management and admin user listing
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getCurrentUser(Long userId) {
        User user = requireUser(userId);
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Your account is inactive. Please contact an administrator");
        }
        return user;
    }

    public User updateProfile(Long userId, Map<String, Object> updates) {
        User user = getCurrentUser(userId);
        if (updates.containsKey("name")) {
            user.setName((String) updates.get("name"));
        }
        if (updates.containsKey("avatarUrl")) {
            user.setAvatarUrl((String) updates.get("avatarUrl"));
        }
        return userRepository.save(user);
    }

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findByIsActiveTrue(pageable);
    }

    public User updateUserRole(Long targetUserId, Role newRole) {
        User user = requireUser(targetUserId);
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Cannot change role for a deactivated user");
        }
        user.setRole(newRole);
        return userRepository.save(user);
    }

    public User deactivateUser(Long targetUserId, Long actorUserId) {
        if (targetUserId.equals(actorUserId)) {
            throw new BadRequestException("You cannot deactivate your own account");
        }

        User targetUser = requireUser(targetUserId);
        if (!Boolean.TRUE.equals(targetUser.getIsActive())) {
            return targetUser;
        }

        if (targetUser.getRole() == Role.ADMIN
                && userRepository.countByRoleAndIsActiveTrue(Role.ADMIN) <= 1) {
            throw new BadRequestException("Cannot deactivate the last active admin account");
        }

        targetUser.setIsActive(false);
        return userRepository.save(targetUser);
    }

    public List<User> getTechnicians() {
        return userRepository.findByRoleAndIsActiveTrue(Role.TECHNICIAN);
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }
}
