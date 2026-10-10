package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.TokensDTO;
import com.mito.sismo.dto.request.TokenRequest;
import com.mito.sismo.entity.RefreshToken;
import com.mito.sismo.entity.Usuario;
import com.mito.sismo.exception.InvalidTokenException;
import com.mito.sismo.exception.UsuarioNotFoundException;
import com.mito.sismo.repository.RefreshTokenRepository;
import com.mito.sismo.repository.UsuarioRepository;
import com.mito.sismo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Servicio para la gestión del ciclo de vida y rotación de Refresh Tokens.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;
    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;

    // Guardar nuevo refresh token en la base de datos
    public RefreshToken guardarToken(Usuario usuario, String jwtToken) {
        RefreshToken refreshToken = RefreshToken.builder()
                .usuario(usuario)
                .token(jwtToken)
                .expiresAt(LocalDateTime.now().plusDays(7))
                .revoked(false)
                .createdAt(LocalDateTime.now())
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    // Generar Refresh Token JWT
    public String generarRefreshToken(Usuario usuario) {
        return jwtUtil.generateRefreshToken(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol() != null ? usuario.getRol().name() : "USUARIO"
        );
    }

    // Generar Access Token JWT
    public String generarAccessToken(Usuario usuario) {
        return jwtUtil.generateAccessToken(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol() != null ? usuario.getRol().name() : "USUARIO"
        );
    }

    // Validar si el refresh token existe, no ha sido revocado y no ha expirado
    public Optional<RefreshToken> validateRefreshToken(String token) {
        return refreshTokenRepository.findByToken(token)
                .filter(rt -> !Boolean.TRUE.equals(rt.getRevoked()) && rt.getExpiresAt().isAfter(LocalDateTime.now()));
    }

    // Revocar un refresh token específico
    public void revokeToken(RefreshToken refreshToken) {
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
    }

    // Revocar todos los tokens de un usuario (para cierre de sesión / logout global)
    @Transactional
    public void revokeAllTokensForUser(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new UsuarioNotFoundException(userId));
        refreshTokenRepository.findAllByUsuario(usuario)
                .forEach(rt -> {
                    rt.setRevoked(true);
                    refreshTokenRepository.save(rt);
                });
    }

    // Rotar refresh token: invalida el anterior y genera un nuevo registro
    public RefreshToken rotateToken(RefreshToken oldToken, String newJwtToken) {
        revokeToken(oldToken);
        return guardarToken(oldToken.getUsuario(), newJwtToken);
    }

    // Refrescar Access Token a partir de un Refresh Token válido
    @Transactional
    public TokensDTO refrescarAccessToken(TokenRequest refreshTokenRequest) {
        RefreshToken refreshTokenAntiguo = validateRefreshToken(refreshTokenRequest.getToken())
                .orElseThrow(() -> new InvalidTokenException("El refresh token proporcionado no es válido o ha expirado."));

        // Generar nuevos tokens (rotación)
        String nuevoAccessToken = generarAccessToken(refreshTokenAntiguo.getUsuario());
        String nuevoRefreshToken = generarRefreshToken(refreshTokenAntiguo.getUsuario());
        rotateToken(refreshTokenAntiguo, nuevoRefreshToken);

        return TokensDTO.builder()
                .accessToken(nuevoAccessToken)
                .refreshToken(nuevoRefreshToken)
                .build();
    }
}
