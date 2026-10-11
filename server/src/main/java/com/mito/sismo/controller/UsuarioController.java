package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.ConfiguracionUsuarioDTO;
import com.mito.sismo.dto.entidades.UsuarioDTO;
import com.mito.sismo.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/usuario")
public class UsuarioController {

    private final UsuarioService configUserService;

    // -Traer  Configuracion Usuario
    @GetMapping("/getConfig")
    ResponseEntity<ConfiguracionUsuarioDTO> traerConfig (
            @RequestHeader("Authorization")
            String authHeader
    ){
        ConfiguracionUsuarioDTO config = configUserService.traerConfig(authHeader);
        return ResponseEntity.ok(config);
    }

    // -Actualizar Configuracion Usuario
    @PutMapping("/updateConfig")
    ResponseEntity<Void> actualizarConfig(
            @RequestHeader("Authorization")
            String authHeader,
            @Valid
            @RequestBody
            ConfiguracionUsuarioDTO configUserDTO
    ){
        configUserService.actualizarConfig(authHeader, configUserDTO);
        return ResponseEntity.ok().build();
    }

    // -Traer Configuracion Usuario
    @GetMapping("/getDatosUsuario")
    ResponseEntity<UsuarioDTO> traerDatosUsuario(
            @RequestHeader("Authorization")
            String authHeader
    ){
        UsuarioDTO user = configUserService.traerDataUser(authHeader);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/updateDataUser")
    ResponseEntity<Void> actualizarDataUser(
            @RequestHeader("Authorization")
            String authHeader,
            @Valid
            @RequestBody
            UsuarioDTO userDTO
    ){
        configUserService.actualizarDataUser(authHeader,userDTO);
        return ResponseEntity.ok().build();
    }


}
