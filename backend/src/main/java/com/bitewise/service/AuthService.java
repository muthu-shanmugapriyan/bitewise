package com.bitewise.service;

import com.bitewise.dto.AuthDtos.*;
import com.bitewise.entity.*;
import com.bitewise.repository.*;
import com.bitewise.security.JwtService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository users;
    private final BusinessRepository businesses;
    private final NotificationPreferenceRepository prefs;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final CurrentUserService current;
    private final NotificationService notifications;
    private final AuditLogRepository audit;

    @Value("${bitewise.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    // A generic response is always returned for forgot-password, regardless
    // of whether the email is registered, so the API can't be used to probe
    // which emails have BiteWise accounts.
    private static final String FORGOT_PASSWORD_GENERIC_MESSAGE =
            "If an account exists for that email, a password reset link has been sent.";

    public AuthService(
            UserRepository users,
            BusinessRepository businesses,
            NotificationPreferenceRepository prefs,
            PasswordEncoder encoder,
            JwtService jwt,
            CurrentUserService current,
            NotificationService notifications,
            AuditLogRepository audit
    ) {
        this.users = users;
        this.businesses = businesses;
        this.prefs = prefs;
        this.encoder = encoder;
        this.jwt = jwt;
        this.current = current;
        this.notifications = notifications;
        this.audit = audit;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {

        if (users.findByEmailIgnoreCase(request.email()).isPresent()) {
            throw new IllegalArgumentException(
                    "Email already registered"
            );
        }

        User user = users.save(
                new User(
                        request.email().toLowerCase(),
                        encoder.encode(request.password()),
                        request.ownerName(),
                        request.phone()
                )
        );

        Business business = businesses.save(
                new Business(
                        user,
                        request.businessName(),
                        request.businessType(),
                        request.location(),
                        request.currency()
                )
        );

        prefs.save(new NotificationPreference(business));

        audit.save(new AuditLog(
                business,
                user,
                "CREATE",
                "ACCOUNT",
                user.getId(),
                "Account and business \"" + business.getName() + "\" created"
        ));

        return new AuthResponse(
                jwt.generate(user.getEmail()),
                user.getEmail(),
                user.getOwnerName()
        );
    }

    public AuthResponse login(LoginRequest request) {

        User user = users
                .findByEmailIgnoreCase(request.email())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid email or password"
                        )
                );

        if (!encoder.matches(
                request.password(),
                user.getPasswordHash()
        )) {
            throw new IllegalArgumentException(
                    "Invalid email or password"
            );
        }

        businesses.findByUserId(user.getId()).ifPresent(business ->
                audit.save(new AuditLog(
                        business,
                        user,
                        "LOGIN",
                        "ACCOUNT",
                        user.getId(),
                        "Signed in"
                ))
        );

        return new AuthResponse(
                jwt.generate(user.getEmail()),
                user.getEmail(),
                user.getOwnerName()
        );
    }

    @Transactional
    public MessageResponse logout() {
        // JWTs are stateless -- there's no server-side session to end --
        // this exists purely to record the activity in the business's
        // history log.
        User user = current.user();
        Business business = current.business();

        audit.save(new AuditLog(
                business,
                user,
                "LOGOUT",
                "ACCOUNT",
                user.getId(),
                "Signed out"
        ));

        return new MessageResponse("Signed out.");
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {

        users.findByEmailIgnoreCase(request.email()).ifPresent(user -> {

            String token = UUID.randomUUID().toString();
            Instant expiry = Instant.now().plus(30, ChronoUnit.MINUTES);

            user.startPasswordReset(token, expiry);
            users.save(user);

            String resetLink = frontendBaseUrl + "/reset-password?token=" + token;

            notifications.sendPasswordReset(user.getEmail(), resetLink);
        });

        // Always the same response — see FORGOT_PASSWORD_GENERIC_MESSAGE.
        return new MessageResponse(FORGOT_PASSWORD_GENERIC_MESSAGE);
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {

        User user = users
                .findByResetToken(request.token())
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "This reset link is invalid or has already been used."
                        )
                );

        if (user.getResetTokenExpiry() == null
                || user.getResetTokenExpiry().isBefore(Instant.now())) {

            user.clearPasswordReset();
            users.save(user);

            throw new IllegalArgumentException(
                    "This reset link has expired. Please request a new one."
            );
        }

        user.setPasswordHash(encoder.encode(request.newPassword()));
        user.clearPasswordReset();
        users.save(user);

        return new MessageResponse(
                "Your password has been reset. You can now sign in with your new password."
        );
    }

    @Transactional
    public MessageResponse changePassword(ChangePasswordRequest request) {

        User user = current.user();

        if (!encoder.matches(
                request.currentPassword(),
                user.getPasswordHash()
        )) {
            throw new IllegalArgumentException(
                    "Current password is incorrect."
            );
        }

        user.setPasswordHash(encoder.encode(request.newPassword()));
        users.save(user);

        return new MessageResponse("Your password has been updated.");
    }
}