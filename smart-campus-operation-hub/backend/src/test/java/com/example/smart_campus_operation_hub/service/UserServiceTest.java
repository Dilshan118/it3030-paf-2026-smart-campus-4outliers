package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.enums.Role;
import com.example.smart_campus_operation_hub.exception.BadRequestException;
import com.example.smart_campus_operation_hub.exception.UnauthorizedException;
import com.example.smart_campus_operation_hub.dto.response.UserResponse;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    private User admin;
    private User regularUser;

    @BeforeEach
    void setUp() {
        admin = new User();
        admin.setId(1L);
        admin.setName("Admin User");
        admin.setRole(Role.ADMIN);
        admin.setIsActive(true);

        regularUser = new User();
        regularUser.setId(2L);
        regularUser.setName("Regular User");
        regularUser.setRole(Role.USER);
        regularUser.setIsActive(true);
    }

    @Test
    void deactivateUser_ActiveUser_Success() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));
        when(userRepository.save(any(User.class))).thenReturn(regularUser);

        User result = userService.deactivateUser(2L, 1L);

        assertFalse(result.getIsActive());
        verify(userRepository).save(regularUser);
    }

    @Test
    void deactivateUser_SelfDeactivation_ThrowsException() {
        assertThrows(BadRequestException.class, () -> userService.deactivateUser(1L, 1L));

        verifyNoInteractions(userRepository);
    }

    @Test
    void deactivateUser_LastActiveAdmin_ThrowsException() {
        User targetAdmin = new User();
        targetAdmin.setId(3L);
        targetAdmin.setRole(Role.ADMIN);
        targetAdmin.setIsActive(true);

        when(userRepository.findById(3L)).thenReturn(Optional.of(targetAdmin));
        when(userRepository.countByRoleAndIsActiveTrue(Role.ADMIN)).thenReturn(1L);

        assertThrows(BadRequestException.class, () -> userService.deactivateUser(3L, 1L));

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deactivateUser_AlreadyInactive_ReturnsUnchangedUser() {
        regularUser.setIsActive(false);
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        User result = userService.deactivateUser(2L, 1L);

        assertFalse(result.getIsActive());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getCurrentUser_Inactive_ThrowsUnauthorized() {
        regularUser.setIsActive(false);
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        assertThrows(UnauthorizedException.class, () -> userService.getCurrentUser(2L));
    }

    @Test
    void getCurrentUser_Active_ReturnsUser() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        UserResponse result = userService.getCurrentUser(2L);

        assertEquals(2L, result.getId());
    }

    @Test
    void getAllUsers_ReturnsOnlyActiveUsers() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> activeUsers = new PageImpl<>(List.of(admin, regularUser), pageable, 2);
        when(userRepository.findByIsActiveTrue(pageable)).thenReturn(activeUsers);

        Page<User> result = userService.getAllUsers(pageable);

        assertEquals(2, result.getTotalElements());
        verify(userRepository).findByIsActiveTrue(pageable);
    }

    @Test
    void updateUserRole_InactiveUser_ThrowsException() {
        regularUser.setIsActive(false);
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        assertThrows(BadRequestException.class, () -> userService.updateUserRole(2L, Role.MANAGER));

        verify(userRepository, never()).save(any(User.class));
    }
}
