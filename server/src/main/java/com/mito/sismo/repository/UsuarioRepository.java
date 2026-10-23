package com.mito.sismo.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.mito.sismo.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    boolean existsByEmail(String email);

    Page<Usuario> findAll(Pageable pageable);

    Optional<Usuario> findByEmail(String email);

    // Bloquea la fila padre, incluso cuando todavía no existe configuración.
    // Evita duplicados concurrentes sin depender de bloqueos en memoria de una
    // instancia.
    @Query(value = "SELECT id FROM usuarios WHERE id = :usuarioId FOR UPDATE", nativeQuery = true)
    Optional<Long> lockForSettings(@Param("usuarioId") Long usuarioId);
}