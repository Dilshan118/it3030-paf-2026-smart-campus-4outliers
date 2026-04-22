package com.example.smart_campus_operation_hub.service;

import com.example.smart_campus_operation_hub.exception.PendingApprovalException;
import com.example.smart_campus_operation_hub.exception.UnauthorizedException;
import com.example.smart_campus_operation_hub.model.User;
import com.example.smart_campus_operation_hub.repository.UserRepository;
import com.example.smart_campus_operation_hub.security.JwtTokenProvider;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public String handleOAuth2Login(OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String avatarUrl = oAuth2User.getAttribute("picture");
        String providerId = oAuth2User.getAttribute("sub");

        User user = userRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, name, avatarUrl, providerId));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            if (user.getRejectedAt() != null) {
                throw new UnauthorizedException("Your access request was declined. Please contact an administrator.");
            }
            throw new PendingApprovalException("Your account is awaiting admin approval.");
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
}
