package com.mito.sismo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.mito.sismo.dto.entidades.ConfiguracionUsuarioDTO;
import com.mito.sismo.dto.entidades.UsuarioDTO;
import com.mito.sismo.dto.request.ConfiguracionUsuarioRequest;
import com.mito.sismo.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/usuario")
public class UsuarioController {

    private final UsuarioService configUserService;

    // -Actualizar Configuracion Usuario
    @PutMapping("/updateConfig")
    ResponseEntity<ConfiguracionUsuarioDTO> actualizarConfig(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody ConfiguracionUsuarioRequest configUserDTO) {
        return ResponseEntity.ok(configUserService.actualizarConfig(authHeader, configUserDTO));
    }

    @PutMapping("/updateDataUser")
    ResponseEntity<Void> actualizarDataUser(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UsuarioDTO userDTO) {
        configUserService.actualizarDataUser(authHeader, userDTO);
        return ResponseEntity.ok().build();
    }

    // -Traer Configuracion Usuario
    @GetMapping("/getConfig")
    ResponseEntity<ConfiguracionUsuarioDTO> traerConfig(
            @RequestHeader("Authorization") String authHeader) {
        ConfiguracionUsuarioDTO config = configUserService.traerConfig(authHeader);
        return ResponseEntity.ok(config);
    }

    // -Traer Configuracion Usuario
    @GetMapping("/getDatosUsuario")
    ResponseEntity<UsuarioDTO> traerDatosUsuario(
            @RequestHeader("Authorization") String authHeader) {
        UsuarioDTO user = configUserService.traerDataUser(authHeader);
        return ResponseEntity.ok(user);
    }

}
