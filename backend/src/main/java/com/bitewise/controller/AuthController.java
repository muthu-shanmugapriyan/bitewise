package com.bitewise.controller;

import com.bitewise.dto.AuthDtos.*;
import com.bitewise.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService service;

    public AuthController(AuthService service) {
        this.service = service;
    }

    @PostMapping("/register")
    public AuthResponse register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return service.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(
            @Valid @RequestBody LoginRequest request
    ) {
        return service.login(request);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        return service.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        return service.resetPassword(request);
    }

    // Requires a valid JWT — not listed in SecurityConfig's public auth
    // endpoints, so it falls under the default "authenticated" rule.
    @PostMapping("/change-password")
    public MessageResponse changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        return service.changePassword(request);
    }

    // Also requires a valid JWT. Stateless JWTs mean there's nothing to
    // invalidate server-side; this just records the activity.
    @PostMapping("/logout")
    public MessageResponse logout() {
        return service.logout();
    }
}