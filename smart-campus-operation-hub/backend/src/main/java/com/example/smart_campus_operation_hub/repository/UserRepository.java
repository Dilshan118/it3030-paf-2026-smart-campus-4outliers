package com.example.smart_campus_operation_hub.repository;

import com.example.smart_campus_operation_hub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;
import com.example.smart_campus_operation_hub.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderId(String providerId);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByRoleAndIsActiveTrue(Role role);
}
