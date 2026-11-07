package com.mito.sismo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mito.sismo.dto.entidades.ReporteSeguridadDTO;
import com.mito.sismo.dto.request.ReporteSeguridadRequest;
import com.mito.sismo.service.ReporteSeguridadService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/reportes-seguridad")
public class ReporteSeguridadController {
    private final ReporteSeguridadService service;

    @PostMapping
    public ResponseEntity<ReporteSeguridadDTO> guardar(@RequestHeader("Authorization") String authorization,
            @Valid @RequestBody ReporteSeguridadRequest request) {
        return ResponseEntity.ok(service.guardarPropio(authorization, request));
    }

    @GetMapping("/mis-reportes")
    public ResponseEntity<List<ReporteSeguridadDTO>> listar(@RequestHeader("Authorization") String authorization) {
        return ResponseEntity.ok(service.listarPropios(authorization));
    }
}
