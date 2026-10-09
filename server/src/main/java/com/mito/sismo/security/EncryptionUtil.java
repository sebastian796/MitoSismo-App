package com.mito.sismo.security;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Componente utilitario para el cifrado y validación de contraseñas de usuario.
 */
@Component
public class EncryptionUtil {

    private final PasswordEncoder passwordEncoder;

    public EncryptionUtil(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    // Encriptar contraseña en texto plano
    public String encryptPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    // Verificar si la contraseña coincide con el hash
    public boolean matches(String rawPassword, String encryptedPassword) {
        return passwordEncoder.matches(rawPassword, encryptedPassword);
    }
}
