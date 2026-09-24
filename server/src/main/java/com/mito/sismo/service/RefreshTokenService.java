package com.mito.sismo.service;

import com.mito.sismo.entity.RefreshToken;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.repository.RefreshTokenRepository;
import com.mito.sismo.security.JwtUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtUtil jwtUtil;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            JwtUtil jwtUtil
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtUtil = jwtUtil;

    }

    // Crear un nuevo refresh token (usando JWT generado en JwtUtil)
    public RefreshToken guardarToken(Usuario usuario, String jwtToken) {
        RefreshToken refreshToken = RefreshToken.builder()
                .usuario(usuario)
                .token(jwtToken) // aquí guardas el JWT completo
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    // Generar Refresh token
    public String generarRefreshToken(Usuario usuario){
        return jwtUtil.generateRefreshToken(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().toString()
        );
    }

    // Generar Acces Token
    public String generarAccessToken(Usuario usuario){
        return jwtUtil.generateAccessToken(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().toString()
        );
    }

    // Validar refresh token
    public Optional<RefreshToken> validateRefreshToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .filter(rt -> !rt.getRevoked() && rt.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    // Revocar un refresh token específico
    public void revokeToken(RefreshToken refreshToken) {
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }

    // Revocar todos los tokens de un usuario (ej. en logout)
    public void revokeAllTokensForUser(Usuario usuario) {
        refreshTokenRepository.findAllByUsuario(usuario)
                .forEach(rt -> {
                    rt.setRevoked(true);
                    refreshTokenRepository.save(rt);
                });
    }

    // Rotar refresh token (invalida el anterior y crea uno nuevo)
    public RefreshToken rotateToken(RefreshToken oldToken, String newJwtToken) {
        revokeToken(oldToken);
        return guardarToken(oldToken.getUsuario(), newJwtToken);
    }
}
