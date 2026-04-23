package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.dto.request.ProfileRequest;
import com.example.smart_campus_operation_hub.dto.response.UserResponse;
import com.example.smart_campus_operation_hub.enums.Role;
import com.example.smart_campus_operation_hub.exception.BadRequestException;
import com.example.smart_campus_operation_hub.exception.ResourceNotFoundException;
import com.example.smart_campus_operation_hub.exception.UnauthorizedException;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

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

    public UserResponse getCurrentUser(Long userId) {
        User user = requireUser(userId);
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Your account is inactive. Please contact an administrator");
        }
        return UserResponse.from(user);
    }

    public UserResponse saveProfile(Long userId, ProfileRequest request, boolean markCompleted) {
        User user = requireUser(userId);
        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new UnauthorizedException("Your account is inactive");
        }
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }
        if (request.getPhone() != null)         user.setPhone(request.getPhone().trim());
        if (request.getAddress() != null)       user.setAddress(request.getAddress().trim());
        if (request.getStudentId() != null)     user.setStudentId(request.getStudentId().trim());
        if (request.getFaculty() != null)       user.setFaculty(request.getFaculty().trim());
        if (request.getSpecialization() != null) user.setSpecialization(request.getSpecialization().trim());
        if (request.getYear() != null)          user.setYear(request.getYear());
        if (request.getSemester() != null)      user.setSemester(request.getSemester());
        if (request.getStaffId() != null)       user.setStaffId(request.getStaffId().trim());
        if (request.getDepartment() != null)    user.setDepartment(request.getDepartment().trim());
        if (markCompleted) {
            user.setProfileCompleted(true);
        }
        return UserResponse.from(userRepository.save(user));
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

    public Page<User> getPendingUsers(Pageable pageable) {
        return userRepository.findByIsActiveFalseAndRejectedAtIsNull(pageable);
    }

    public User approveUser(Long targetUserId, Role role) {
        User user = requireUser(targetUserId);
        if (Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("User is already active");
        }
        user.setIsActive(true);
        user.setRole(role != null ? role : Role.USER);
        user.setRejectedAt(null);
        return userRepository.save(user);
    }

    public User rejectUser(Long targetUserId) {
        User user = requireUser(targetUserId);
        if (Boolean.TRUE.equals(user.getIsActive())) {
            throw new BadRequestException("Cannot reject an already active user");
        }
        user.setRejectedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public List<User> getTechnicians() {
        return userRepository.findByRoleAndIsActiveTrue(Role.TECHNICIAN);
    }

    private User requireUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    }
}
