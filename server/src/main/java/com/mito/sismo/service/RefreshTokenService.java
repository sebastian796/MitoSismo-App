package com.mito.sismo.service;

import com.mito.sismo.entity.RefreshToken;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.repository.RefreshTokenRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    // Crear un nuevo refresh token
    public RefreshToken createRefreshToken(Usuario usuario, int daysValid) {
        RefreshToken refreshToken = RefreshToken.builder()
                .usuario(usuario)
                .token(UUID.randomUUID().toString()) // token aleatorio
                .expiresAt(LocalDateTime.now().plusDays(daysValid))
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    // Validar refresh token
    public Optional<RefreshToken> validateRefreshToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .filter(rt -> !rt.getRevoked() && rt.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    // Revocar refresh token
    public void revokeToken(RefreshToken refreshToken) {
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }

    // Rotar refresh token (invalida el anterior y crea uno nuevo)
    public RefreshToken rotateToken(RefreshToken oldToken, int daysValid) {
        revokeToken(oldToken);
        return createRefreshToken(oldToken.getUsuario(), daysValid);
    }
}

