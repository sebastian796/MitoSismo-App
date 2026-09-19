package com.mito.sismo.repository;

import com.mito.sismo.entity.UsuarioCriatura;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioCriaturaRepository extends JpaRepository<UsuarioCriatura, Long> {
    Optional<UsuarioCriatura> findByUsuarioId(Long usuarioId);
    List<UsuarioCriatura> findByCriaturaId(Long criaturaId);
}
