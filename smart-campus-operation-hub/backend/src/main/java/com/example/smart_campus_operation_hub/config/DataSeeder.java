package com.example.smart_campus_operation_hub.config;

import com.example.smart_campus_operation_hub.enums.Role;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            if (!userRepository.existsByEmail("test@smartcampus.edu")) {
                User testUser = new User();
                testUser.setName("Test User");
                testUser.setEmail("test@smartcampus.edu");
                testUser.setRole(Role.USER);
                testUser.setIsActive(true);
                userRepository.save(testUser);
            }

            if (!userRepository.existsByEmail("admin@smartcampus.edu")) {
                User admin = new User();
                admin.setName("System Admin");
                admin.setEmail("admin@smartcampus.edu");
                admin.setRole(Role.ADMIN);
                admin.setIsActive(true);
                userRepository.save(admin);
            }

            if (!userRepository.existsByEmail("manager@smartcampus.edu")) {
                User manager = new User();
                manager.setName("Facility Manager");
                manager.setEmail("manager@smartcampus.edu");
                manager.setRole(Role.MANAGER);
                manager.setIsActive(true);
                userRepository.save(manager);
            }

            if (!userRepository.existsByEmail("tech@smartcampus.edu")) {
                User technician = new User();
                technician.setName("Campus Technician");
                technician.setEmail("tech@smartcampus.edu");
                technician.setRole(Role.TECHNICIAN);
                technician.setIsActive(true);
                userRepository.save(technician);
            }
        };
    }
}
