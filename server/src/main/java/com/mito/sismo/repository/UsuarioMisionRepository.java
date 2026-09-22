package com.mito.sismo.repository;

import com.mito.sismo.entity.UsuarioMision;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsuarioMisionRepository extends JpaRepository<UsuarioMision, Long> {
    List<UsuarioMision> findByUsuarioId(Long usuarioId);
    List<UsuarioMision> findByMisionId(Long misionId);
    Page<UsuarioMision> findByUsuarioId(Long usuarioId, Pageable pageable);
}
