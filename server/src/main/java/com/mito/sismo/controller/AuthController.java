package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.RotateAccesToken;
import com.mito.sismo.dto.entidades.UsuarioDTO;
import com.mito.sismo.dto.request.TokenRequest;
import com.mito.sismo.dto.request.UserCreateRequest;
import com.mito.sismo.dto.request.LoginRequest;
import com.mito.sismo.security.JwtUtil;
import com.mito.sismo.service.RefreshTokenService;
import com.mito.sismo.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/auth")
public class AuthController {

    private final UsuarioService usuarioService;
    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;

    @GetMapping("/")
    public String saludar(){
        return ":: API MitoSismos: Funcional";
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
    public ResponseEntity<RotateAccesToken> refleshToken(
            @Valid
            @RequestBody
            TokenRequest refleshToken
    ){
            RotateAccesToken accessToken = refreshTokenService.refrescarAccessToken(refleshToken);
            return ResponseEntity.ok(accessToken);
    }

    @PostMapping("/invalidacion")
    public ResponseEntity<Void> logoutUser(
            @RequestParam
            Long userId
    ){
        refreshTokenService.revokeAllTokensForUser(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/validacion")
    public ResponseEntity<Boolean> validateToken(
            @RequestBody
            TokenRequest token
    ){
        boolean isValid = jwtUtil.validateToken(token.getToken());
        return ResponseEntity.ok(isValid);
    }
}
