package com.mito.sismo.repository;

import com.mito.sismo.entity.ReporteSeguridad;
import com.mito.sismo.entity.enums.EstadoSeguridad;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReporteSeguridadRepository extends JpaRepository<ReporteSeguridad, Long> {
    List<ReporteSeguridad> findByUsuarioId(Long usuarioId);
    List<ReporteSeguridad> findByEstadoSeguridad(EstadoSeguridad estado);
}

