package com.example.smart_campus_operation_hub.repository;

import com.example.smart_campus_operation_hub.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.List;
import com.example.smart_campus_operation_hub.enums.Role;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByProviderId(String providerId);
    boolean existsByEmail(String email);
    Page<User> findByIsActiveTrue(Pageable pageable);
    List<User> findByRole(Role role);
    List<User> findByRoleAndIsActiveTrue(Role role);
    long countByRoleAndIsActiveTrue(Role role);
}
