package com.mito.sismo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mito.sismo.dto.entidades.ReporteSeguridadDTO;
import com.mito.sismo.dto.request.ReporteSeguridadRequest;
import com.mito.sismo.entity.ReporteSeguridad;
import com.mito.sismo.repository.ReporteSeguridadRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ReporteSeguridadService {
    private final ReporteSeguridadRepository repository;
    private final UsuarioService usuarioService;

    @Transactional
    public ReporteSeguridadDTO guardarPropio(String authorization, ReporteSeguridadRequest request) {
        var usuario = usuarioService.extraerUsuarioEmailToken(authorization);
        var reporte = repository.findByUsuarioIdAndSismoExternoId(usuario.getId(), request.getSismoExternoId())
                .orElseGet(() -> ReporteSeguridad.builder().usuario(usuario).sismoExternoId(request.getSismoExternoId())
                        .build());
        reporte.setEstadoSeguridad(request.getEstadoSeguridad());
        reporte.setSentido(request.getSentido());
        reporte.setLatitud(request.getLatitud());
        reporte.setLongitud(request.getLongitud());
        reporte.setComentario(request.getComentario());
        return ReporteSeguridadDTO.fromEntity(repository.save(reporte));
    }

    @Transactional(readOnly = true)
    public List<ReporteSeguridadDTO> listarPropios(String authorization) {
        var usuario = usuarioService.extraerUsuarioEmailToken(authorization);
        return repository.findByUsuarioIdOrderByCreatedAtDesc(usuario.getId()).stream()
                .map(ReporteSeguridadDTO::fromEntity).toList();
    }
}
