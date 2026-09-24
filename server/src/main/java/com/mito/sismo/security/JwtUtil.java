package com.mito.sismo.security;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Date;
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

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
            signedJWT.sign(new MACSigner(secret.getBytes()));

            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar Access Token", e);
        }
    }

    // Genera Refresh Token con expiración de 7 días
    public String generateRefreshToken(Long userId, String username, String email, String rol) {
        try {
            Date now = new Date();
            Date expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 días

            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(username)
                    .claim("userId", userId)
                    .claim("email", email)
                    .claim("role",rol)
                    .issueTime(now)
                    .expirationTime(expiry)
                    .build();

            JWSHeader header = new JWSHeader.Builder(JWSAlgorithm.HS256)
                    .type(JOSEObjectType.JWT)
                    .build();

            SignedJWT signedJWT = new SignedJWT(header, claims);
            signedJWT.sign(new MACSigner(secret.getBytes()));

            return signedJWT.serialize();
        } catch (Exception e) {
            throw new RuntimeException("Error al generar Refresh Token", e);
        }
    }

    // Valida cualquier token
    public boolean validateToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            JWSVerifier verifier = new MACVerifier(secret.getBytes());

            if (!signedJWT.verify(verifier)) {
                return false;
            }

            Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
            return expiration != null && expiration.after(new Date());
        } catch (Exception e) {
            return false;
        }
    }

    // Extrae email
    public String extractEmail(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getStringClaim("email");
        } catch (Exception e) {
            throw new RuntimeException("Error al extraer email del token", e);
        }
    }

    // Extrae rol
    public String extractRole(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getStringClaim("role");
        } catch (Exception e) {
            throw new RuntimeException("Error al extraer rol del token", e);
        }
    }

    // Extrae userId
    public Long extractUserId(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            return signedJWT.getJWTClaimsSet().getLongClaim("userId");
        } catch (Exception e) {
            throw new RuntimeException("Error al extraer userId del token", e);
        }
    }
}
