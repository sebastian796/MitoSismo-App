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
    public String generateAccessToken(String username, String role) throws Exception {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutos

        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(username)
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
    }

    // Valida Access Token
    public boolean validateAccessToken(String token) throws Exception {
        SignedJWT signedJWT = SignedJWT.parse(token);
        JWSVerifier verifier = new MACVerifier(secret.getBytes());

        if (!signedJWT.verify(verifier)) {
            return false;
        }

        Date expiration = signedJWT.getJWTClaimsSet().getExpirationTime();
        return expiration != null && expiration.after(new Date());
    }

    // Extrae username
    public String extractUsername(String token) throws Exception {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getSubject();
    }

    // Extrae rol
    public String extractRole(String token) throws Exception {
        SignedJWT signedJWT = SignedJWT.parse(token);
        return signedJWT.getJWTClaimsSet().getStringClaim("role");
    }
}
