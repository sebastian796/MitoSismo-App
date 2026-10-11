package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.ContactoEmergenciaDTO;
import com.mito.sismo.service.NumeroEmergenciaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/contectoEmergencia")
public class NumeroEmergenciaController {

    private final NumeroEmergenciaService numEmergService;

    // -Traer Numero de Emergencia
    @GetMapping("/getListContactoEmergencia")
    ResponseEntity<List<ContactoEmergenciaDTO>> traerListContacto(){
        List<ContactoEmergenciaDTO> list = numEmergService.traerListContacto();
        return ResponseEntity.ok(list);
    }

}
