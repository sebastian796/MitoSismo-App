package com.mito.sismo.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Utilidad para la creación, firma y validación de tokens JWT (HS256).
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret:cGFzc3dvcmRfc3VwZXJfc2VjcmV0X2tleV9taXRvc2lzbW9fYXBwXzIwMjZfMjU2Yml0cw==}")
    private String secret;

    // Obtener bytes de la clave asegurando el tamaño mínimo requerido por HMAC-SHA256 (32 bytes / 256 bits)
    private byte[] getSecretBytes() {
        byte[] keyBytes = (secret != null ? secret : "mitosis_secret_default_key_2026_safe").getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            return padded;
        }
        return keyBytes;
    }

    // Genera Access Token con expiración de 15 minutos
    public String generateAccessToken(Long userId, String username, String email, String role) {
        try {
            Date now = new Date();
            Date expiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutos

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(username)
                    .claim("userId", userId)
                    .claim("email", email)
                    .claim("role", role)
                    .issueTime(now)
                    .expirationTime(expiry)
                    .build();

            JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.HS256)
                    .type(JOSEObjectType.JWT)
                    .build();

            SignedJWT signedJWT = new SignedJWT(header, claims);
            signedJWT.sign(new MACSigner(getSecretBytes()));

            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar Access Token", e);
        }
    }

    // Genera Refresh Token con expiración de 7 días
    public String generateRefreshToken(Long userId, String username, String email, String rol) {
        try {
            Date now = new Date();
            Date expiry = new Date(now.getTime() + 7L * 24 * 60 * 60 * 1000); // 7 días

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(username)
                    .claim("userId", userId)
                    .claim("email", email)
                    .claim("role", rol)
                    .issueTime(now)
                    .expirationTime(expiry)
                    .build();

            JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.HS256)
                    .type(JOSEObjectType.JWT)
                    .build();

            SignedJWT signedJWT = new SignedJWT(header, claims);
            signedJWT.sign(new MACSigner(getSecretBytes()));

            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar Refresh Token", e);
        }
    }

    // Valida la firma y expiración de cualquier token
    public boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(getSecretBytes());

            if (!signedJWT.verify(verifier)) {
                return false;
            }

            Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
            return expiration != null && expiration.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // Extrae email del claim
    public String extractEmail(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getStringClaim("email");
        } catch (Exception e) {
            throw new RuntimeException("Error al extraer email del token", e);
        }
    }

    // Extrae rol del claim
    public String extractRole(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getStringClaim("role");
        } catch (Exception e) {
            throw new RuntimeException("Error al extraer rol del token", e);
        }
    }

    // Extrae userId del claim
    public Long extractUserId(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getLongClaim("userId");
        } catch (Exception e) {
            throw new RuntimeException("Error al extraer userId del token", e);
        }
    }
}
