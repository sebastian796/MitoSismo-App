
package com.mito.sismo.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mito.sismo.dto.entidades.CriaturaDTO;
import com.mito.sismo.dto.entidades.CriaturaDataDTO;
import com.mito.sismo.service.CriaturaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/criatura")
public class CriaturaController {

    private final CriaturaService criaturaService;

    @GetMapping("/eleccion")
    public ResponseEntity<List<CriaturaDTO>> traerCriaturas() {
        List<CriaturaDTO> lista = criaturaService.mostrarCriaturas();
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/publico")
    public ResponseEntity<CriaturaDTO> traerCriaturaPublica() {
        CriaturaDTO publico = criaturaService.mostrarCriaturaPrueba();
        return ResponseEntity.ok(publico);
    }

    @GetMapping("/myCriatura")
    public ResponseEntity<CriaturaDataDTO> traerMyCriatura(
            @RequestHeader("Authorization") String authHeader) {
        CriaturaDataDTO cria = criaturaService.mostrarMyCriatura(authHeader);

        return ResponseEntity.ok(cria);
    }
}
