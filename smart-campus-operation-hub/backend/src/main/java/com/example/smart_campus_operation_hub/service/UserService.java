package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.springframework.stereotype.Service;

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

    // TODO: getCurrentUser(Long userId)
    // TODO: updateProfile(Long userId, UserUpdateRequest request)
    // TODO: getAllUsers(Pageable pageable) — Admin only
    // TODO: updateUserRole(Long userId, Role newRole) — Admin only
}
