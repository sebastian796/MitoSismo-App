package com.mito.sismo.repository;

import com.mito.sismo.entity.FasePrevencion;
import com.mito.sismo.entity.enums.ClaveFase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio JPA para las fases de prevención de sismos.
 */
@Repository
public interface FasePrevencionRepository extends JpaRepository<FasePrevencion, Integer> {

    Optional<FasePrevencion> findByClave(ClaveFase clave);

    boolean existsByClave(ClaveFase clave);
}
