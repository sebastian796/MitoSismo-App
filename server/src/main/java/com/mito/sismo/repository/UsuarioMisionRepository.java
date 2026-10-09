package com.mito.sismo.repository;

import com.mito.sismo.entity.UsuarioMision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio JPA para el seguimiento de misiones de cada usuario.
 */
@Repository
public interface UsuarioMisionRepository extends JpaRepository<UsuarioMision, Long> {

    List<UsuarioMision> findByUsuarioId(Long usuarioId);

    List<UsuarioMision> findByMisionId(Integer misionId);

    Optional<UsuarioMision> findByUsuarioIdAndMisionId(Long usuarioId, Integer misionId);

    Page<UsuarioMision> findByUsuarioId(Long usuarioId, Pageable pageable);
}
