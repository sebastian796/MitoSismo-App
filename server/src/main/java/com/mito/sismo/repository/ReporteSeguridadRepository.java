package com.mito.sismo.repository;

import com.mito.sismo.entity.ReporteSeguridad;
import com.mito.sismo.entity.enums.EstadoSeguridad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio JPA para reportes comunitarios de seguridad ante sismos.
 */
@Repository
public interface ReporteSeguridadRepository extends JpaRepository<ReporteSeguridad, Long> {

    List<ReporteSeguridad> findByUsuarioId(Long usuarioId);

    List<ReporteSeguridad> findBySismoExternoId(String sismoExternoId);

    List<ReporteSeguridad> findByEstadoSeguridad(EstadoSeguridad estadoSeguridad);
}
