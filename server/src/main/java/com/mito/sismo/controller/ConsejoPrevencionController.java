package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.ConsejoPrevencionDTO;
import com.mito.sismo.service.ConsejoPrevencionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prevencion")
@RequiredArgsConstructor
public class ConsejoPrevencionController {

    private final ConsejoPrevencionService consejoPrevenService;

    // -Traer Consejos
    @GetMapping("/")
    ResponseEntity<List<ConsejoPrevencionDTO>> traerConsejos(){
        List<ConsejoPrevencionDTO> list = consejoPrevenService.listConsejos();
        return ResponseEntity.ok(list);
    }

    // -Traer Consejos Antes
    @GetMapping("/antes")
    ResponseEntity<List<ConsejoPrevencionDTO>> traerConsejosAntes(){
        List<ConsejoPrevencionDTO> list = consejoPrevenService.listConsejoAntes();
        return ResponseEntity.ok(list);
    }

    // -Traer Consejos Durante
    @GetMapping("/durante")
    ResponseEntity<List<ConsejoPrevencionDTO>> traerConsejoDurante(){
        List<ConsejoPrevencionDTO> list = consejoPrevenService.listConsejoDurante();
        return ResponseEntity.ok(list);
    }

    // -Traer Consejos Despues
    @GetMapping("/despues")
    ResponseEntity<List<ConsejoPrevencionDTO>> traerConsejoDespues(){
        List<ConsejoPrevencionDTO> list = consejoPrevenService.listConsejoDespues();
        return ResponseEntity.ok(list);
    }

}
