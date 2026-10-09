package com.mito.sismo.repository;

import com.mito.sismo.entity.UsuarioCriatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para la relación Usuario-Criatura.
 */
@Repository
public interface UsuarioCriaturaRepository extends JpaRepository<UsuarioCriatura, Long> {

    Optional<UsuarioCriatura> findByUsuarioId(Long usuarioId);

    List<UsuarioCriatura> findByCriaturaId(Integer criaturaId);
}
