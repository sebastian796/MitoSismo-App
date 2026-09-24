package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.AccessTokenDTO;
import com.mito.sismo.dto.entidades.UsuarioDTO;
import com.mito.sismo.dto.request.UserCreateRequest;
import com.mito.sismo.dto.request.LoginRequest;
import com.mito.sismo.service.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService){
        this.usuarioService = usuarioService;
    }


    @PostMapping("/registrar")
    public ResponseEntity<UsuarioDTO> registrarUsuario(
            @Valid
            @RequestBody
            UserCreateRequest usuarioCreateDTO
    ){
        UsuarioDTO usuario = usuarioService.registrarUsuario(usuarioCreateDTO);
        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/login")
    public ResponseEntity<UsuarioDTO> loginUsuario(
            @Valid
            @RequestBody
            LoginRequest usuarioLogDTO
    ){
        UsuarioDTO usuario = usuarioService.loginUsuario(usuarioLogDTO);
        return ResponseEntity.ok(usuario);
    }

    @PostMapping("/reflesh")
    AccessTokenDTO refleshToken(RefleshTokenRequest refleshToken ){

    }

    @PostMapping("/invalidacion")
    void logoutUser(Long userId){

    }

    @PostMapping("/validacion")
    boolean validateToken(TokenRequest tokenRequest){
        return true;
    }
}
