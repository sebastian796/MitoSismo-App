package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.MisionDTO;
import com.mito.sismo.service.MisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/misiones")
public class MisionController {

    private final MisionService misionService;

    // Listar todas las misiones
    @GetMapping("/")
    ResponseEntity<List<MisionDTO>>(){

    }
    // Listar todas las misiones completas
    // Listar todas las misiones pendientes
    // Listar misiones por estado
    // Listar misiones por grado
    // Completar Mision



}
