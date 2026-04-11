package com.example.smart_campus_operation_hub.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security configuration.
 *
 * INITIAL SETUP: All endpoints are permitted so everyone can test during development.
 * TODO (Member 4): Add JWT filter, OAuth2 login, and role-based access rules.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity  // enables @PreAuthorize annotations on controllers
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // disable CSRF for REST API
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // TODO: tighten these rules after OAuth2 is set up
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .anyRequest().permitAll()  // TEMPORARY: allow all for dev
                );

        return http.build();
    }
}
