package com.mito.sismo.repository;

import com.mito.sismo.entity.ConfiguracionUsuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConfiguracionUsuarioRepository extends JpaRepository<ConfiguracionUsuario, Long> {

    // Buscar configuración por usuario
    Optional<ConfiguracionUsuario> findByUsuarioId(Long usuarioId);

    // Verificar si un usuario ya tiene configuración
    boolean existsByUsuarioId(Long usuarioId);
}