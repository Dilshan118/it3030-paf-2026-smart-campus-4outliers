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
            // Check if user 1 exists, if not create a mock user for testing Tickets
            if (!userRepository.existsById(1L)) {
                User mockUser = new User();
                mockUser.setName("Test User");
                mockUser.setEmail("test@smartcampus.edu");
                mockUser.setRole(Role.USER);
                mockUser.setIsActive(true);
                userRepository.save(mockUser);
                
                System.out.println("====== SEEDED MOCK USER 1 FOR TICKET TESTING ======");
            }
        };
    }
}
