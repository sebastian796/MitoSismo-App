package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.CriaturaDTO;
import com.mito.sismo.dto.entidades.CriaturaDataDTO;
import com.mito.sismo.entity.Criatura;
import com.mito.sismo.service.CriaturaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/criatura")
public class CriaturaController {

    private final CriaturaService criaturaService;

    // -Lista de Criaturas para Elegir
    @GetMapping("/eleccion")
    ResponseEntity<List<CriaturaDTO>> traerCriaturas(){
        List<CriaturaDTO> lista = criaturaService.mostrarCriaturas();
        return ResponseEntity.ok(lista);
    }

    // -Lista de Criatura de uso publico
    @GetMapping("/publico")
    ResponseEntity<CriaturaDTO> traerCriaturaPublica(){
        CriaturaDTO publico = criaturaService.mostrarCriaturaPrueba();
        return ResponseEntity.ok(publico);
    }

    // -Criatura por Usuario
    @GetMapping("/myCriatura")
    ResponseEntity<CriaturaDataDTO> traerMyCriatura(
            @RequestHeader
            String authHeader
    ){
        CriaturaDataDTO cria = criaturaService.mostrarMyCriatura(authHeader);
        return ResponseEntity.ok(cria);
    }



}
