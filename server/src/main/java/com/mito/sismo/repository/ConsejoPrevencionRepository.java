package com.mito.sismo.repository;

import com.mito.sismo.entity.ConsejoPrevencion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsejoPrevencionRepository extends JpaRepository<ConsejoPrevencion, Long> {
    List<ConsejoPrevencion> findByFaseId(Long faseId);
}
