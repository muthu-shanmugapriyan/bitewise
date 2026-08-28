package com.bitewise.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwt;
    private final UserDetailsServiceImpl users;

    public JwtAuthFilter(
            JwtService jwt,
            UserDetailsServiceImpl users
    ) {
        this.jwt = jwt;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        System.out.println(
                ">>> JWT FILTER: " + request.getMethod()
                        + " " + request.getRequestURI()
        );

        if (authorizationHeader == null
                || !authorizationHeader.startsWith("Bearer ")) {

            System.out.println(">>> JWT FILTER: No Bearer token");

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7).trim();

        if (token.isEmpty()) {
            System.out.println(">>> JWT FILTER: Empty token");

            filterChain.doFilter(request, response);
            return;
        }

        try {

            if (!jwt.valid(token)) {

                System.out.println(">>> JWT FILTER: Token INVALID");

                SecurityContextHolder.clearContext();

                filterChain.doFilter(request, response);
                return;
            }

            String email = jwt.extractEmail(token);

            System.out.println(
                    ">>> JWT FILTER: Token valid, email = " + email
            );

            UserDetails userDetails =
                    users.loadUserByUsername(email);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );

            authentication.setDetails(
                    new WebAuthenticationDetailsSource()
                            .buildDetails(request)
            );

            SecurityContextHolder
                    .getContext()
                    .setAuthentication(authentication);

            System.out.println(
                    ">>> JWT FILTER: Authentication set successfully"
            );

        } catch (Exception e) {

            System.out.println(
                    ">>> JWT FILTER ERROR: "
                            + e.getClass().getName()
            );

            System.out.println(
                    ">>> JWT FILTER ERROR MESSAGE: "
                            + e.getMessage()
            );

            e.printStackTrace();

            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}