package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.MisionDTO;
import com.mito.sismo.service.MisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/misiones")
public class MisionController {

    private final MisionService misionService;

    // Listar todas las misiones
    @GetMapping("/")
    ResponseEntity<List<MisionDTO>> traerListaMisiones(
            @RequestHeader("Authorization")
            String authHeader
    ){
        List<MisionDTO> listaMisiones = misionService.traerListaMisiones(authHeader);
        return ResponseEntity.ok(listaMisiones);
    }

    // Listar todas las misiones completas
    @GetMapping("/completas")
    ResponseEntity<List<MisionDTO>> getListMissionComplet(
            @RequestHeader("Authorization")
            String authHeader
    ){
        List<MisionDTO> listMissionComplet = misionService.getListMissionComplet(authHeader);
        return ResponseEntity.ok(listMissionComplet);
    }

    // Listar todas las misiones pendientes
    @GetMapping("/incompleta")
    ResponseEntity<List<MisionDTO>> getListMissionIncomplet(
            @RequestHeader("Authorization")
            String authHeader
    ){
        List<MisionDTO> listMissionIncomplet = misionService.getListMissionIncomplet(authHeader);
        return ResponseEntity.ok(listMissionIncomplet);
    }
/*
    // Marcar Mision Completa
    @PostMapping("/completada")
    ResponseEntity<Void> completarMision(
            @RequestParam
            Long idMision,
            @RequestHeader("Authorization")
            String authHeader
    ){
        misionService.completarMision(idMision, authHeader);
    }
*/


}
