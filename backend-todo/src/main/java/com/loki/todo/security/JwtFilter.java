package com.loki.todo.security;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        try {

            String header = request.getHeader("Authorization");

            if (header != null && header.startsWith("Bearer ")) {

                String token = header.substring(7);

                String username = jwtUtil.extractUsername(token);
                Long workspaceId = jwtUtil.extractWorkspaceId(token);

                WorkspaceContext.setWorkspaceId(workspaceId);

                if (username != null) {

                    // FIXED: Use CustomUserDetails instead of CurrentUser
                    CustomUserDetails userDetails = new CustomUserDetails(username);

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,  // Changed from CurrentUser to CustomUserDetails
                                    null,
                                    null
                            );

                    SecurityContextHolder.getContext()
                            .setAuthentication(authentication);
                }
            }

        } catch (ExpiredJwtException ex) {
            // token expired -> do NOT crash
            SecurityContextHolder.clearContext();

        } catch (Exception ex) {
            // invalid token
            SecurityContextHolder.clearContext();
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Clear workspace context
            WorkspaceContext.clear();
        }
    }
}