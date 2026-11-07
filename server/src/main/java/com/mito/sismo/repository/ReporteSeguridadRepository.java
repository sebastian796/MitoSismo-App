package com.mito.sismo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.mito.sismo.entity.ReporteSeguridad;
import com.mito.sismo.entity.enums.EstadoSeguridad;

public interface ReporteSeguridadRepository extends JpaRepository<ReporteSeguridad, Long> {

    List<ReporteSeguridad> findByEstadoSeguridad(EstadoSeguridad estadoSeguridad);

    List<ReporteSeguridad> findBySismoExternoId(String sismoExternoId);

    java.util.Optional<ReporteSeguridad> findByUsuarioIdAndSismoExternoId(Long usuarioId, String sismoExternoId);

    List<ReporteSeguridad> findByUsuarioIdOrderByCreatedAtDesc(Long usuarioId);
}
