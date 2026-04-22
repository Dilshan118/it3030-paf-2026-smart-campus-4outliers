package com.example.smart_campus_operation_hub.security;

import com.example.smart_campus_operation_hub.exception.PendingApprovalException;
import com.example.smart_campus_operation_hub.exception.UnauthorizedException;
import com.example.smart_campus_operation_hub.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2SuccessHandler implements AuthenticationSuccessHandler {

    private final AuthService authService;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public OAuth2SuccessHandler(AuthService authService) {
        this.authService = authService;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        try {
            String token = authService.handleOAuth2Login(oAuth2User);
            response.sendRedirect(frontendUrl + "/auth/callback?token=" + token);
        } catch (PendingApprovalException e) {
            response.sendRedirect(frontendUrl + "/pending-approval");
        } catch (UnauthorizedException e) {
            response.sendRedirect(frontendUrl + "/login?error=access_denied");
        } catch (Exception e) {
            System.err.println("[OAuth2SuccessHandler] Unexpected error during login: " + e.getMessage());
            e.printStackTrace();
            response.sendRedirect(frontendUrl + "/login?error=server_error");
        }
    }
}
