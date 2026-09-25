package com.mito.sismo.dto;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public class CustomUserPrincipal implements UserDetails {
    private final Long userId;
    private final String email;
    private final String role;

    public CustomUserPrincipal(Long userId, String email, String role) {
        this.userId = userId;
        this.email = email;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return null; // No se usa en JWT
    }

    @Override
    public String getUsername() {
        return email; // Usamos el email como identificador
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // Siempre true, la expiración la maneja el JWT
    }

    @Override
    public boolean isAccountNonLocked() {
        return true; // Siempre true, bloqueo se maneja en lógica extra si lo deseas
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // Siempre true, credenciales expiran según el JWT
    }

    @Override
    public boolean isEnabled() {
        return true; // Siempre true, salvo que quieras manejar estado en BD
    }
}
