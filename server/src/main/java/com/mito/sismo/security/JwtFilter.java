package com.mito.sismo.security;

import com.mito.sismo.dto.CustomUserPrincipal;
import com.mito.sismo.exception.InvalidTokenException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;


    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwtToken = authHeader.substring(7);
            try {
                if (!jwtUtil.validateToken(jwtToken)) {
                    throw new InvalidTokenException("El token ha expirado o no es válido.");
                }

                // Extraer claims del token
                Long userId = jwtUtil.extractUserId(jwtToken);
                String email = jwtUtil.extractEmail(jwtToken);
                String role = jwtUtil.extractRole(jwtToken);

                // Configurar contexto de seguridad
                if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    GrantedAuthority authority = new SimpleGrantedAuthority(role);

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    new CustomUserPrincipal(userId, email, role), // principal con datos del usuario
                                    null,
                                    Collections.singletonList(authority)
                            );

                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }

            } catch (InvalidTokenException e) {
                logger.error("Error de autenticación JWT: " + e.getMessage());
                throw e;
            } catch (Exception e) {
                throw new RuntimeException("Error procesando JWT", e);
            }
        }

        filterChain.doFilter(request, response);
    }
}
