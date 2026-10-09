package com.mito.sismo.security;

import com.mito.sismo.dto.CustomUserPrincipal;
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

/**
 * Filtro interceptor que valida el token Bearer JWT en cada petición HTTP
 * y establece el contexto de seguridad de Spring Security.
 */
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

        // Verificar presencia del encabezado Authorization Bearer
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String jwtToken = authHeader.substring(7).trim();
            try {
                // Validar firma y vigencia del JWT
                if (jwtUtil.validateToken(jwtToken)) {
                    Long userId = jwtUtil.extractUserId(jwtToken);
                    String email = jwtUtil.extractEmail(jwtToken);
                    String role = jwtUtil.extractRole(jwtToken);

                    // Si el usuario no está aún autenticado en el contexto actual
                    if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        GrantedAuthority authority = new SimpleGrantedAuthority(role != null ? role : "USUARIO");

                        CustomUserPrincipal principal = new CustomUserPrincipal(userId, email, role);

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        principal,
                                        null,
                                        Collections.singletonList(authority)
                                );

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                } else {
                    logger.warn("Token JWT no válido o expirado recibido para: " + request.getRequestURI());
                }
            } catch (Exception e) {
                // Registrar advertencia sin detener el ciclo con excepción no controlada
                logger.error("Error al procesar el token JWT: " + e.getMessage());
            }
        }

        // Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}
