package com.bitewise.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public final class AuthDtos {

    private AuthDtos() {
    }

    public record RegisterRequest(

            @Email
            @NotBlank
            String email,

            @NotBlank
            @Size(min = 8, max = 100)
            String password,

            @NotBlank
            String ownerName,

            String phone,

            @NotBlank
            String businessName,

            @NotBlank
            String businessType,

            String location,

            String currency
    ) {
    }

    public record LoginRequest(

            @Email
            @NotBlank
            String email,

            @NotBlank
            String password
    ) {
    }

    public record AuthResponse(
            String token,
            String email,
            String ownerName
    ) {
    }

    public record ForgotPasswordRequest(
            @Email
            @NotBlank
            String email
    ) {
    }

    public record ResetPasswordRequest(
            @NotBlank
            String token,

            @NotBlank
            @Size(min = 8, max = 100)
            String newPassword
    ) {
    }

    public record ChangePasswordRequest(
            @NotBlank
            String currentPassword,

            @NotBlank
            @Size(min = 8, max = 100)
            String newPassword
    ) {
    }

    public record MessageResponse(
            String message
    ) {
    }
}