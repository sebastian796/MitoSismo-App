package com.mito.sismo.repository;

import com.mito.sismo.entity.ConsejoPrevencion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para los consejos de prevención asociados a fases.
 */
@Repository
public interface ConsejoPrevencionRepository extends JpaRepository<ConsejoPrevencion, Integer> {

    List<ConsejoPrevencion> findByFaseId(Integer faseId);

    List<ConsejoPrevencion> findByFaseIdOrderByOrdenAsc(Integer faseId);
}
