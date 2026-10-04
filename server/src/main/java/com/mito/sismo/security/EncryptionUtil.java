package com.mito.sismo.security;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
@Component
public class EncryptionUtil {
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    public String encryptPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }
    public boolean matches(String rawPassword, String encryptedPassword) {
        return passwordEncoder.matches(rawPassword, encryptedPassword);
    }
}