package com.mito.sismo.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class EncryptionUtil {

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Encriptar contraseña
    public String encryptPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    // Verificar contraseña
    public boolean matches(String rawPassword, String encryptedPassword) {
        return passwordEncoder.matches(rawPassword, encryptedPassword);
    }
}
