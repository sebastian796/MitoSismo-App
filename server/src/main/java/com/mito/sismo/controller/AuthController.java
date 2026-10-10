package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.TokensDTO;
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

    private final UsuarioService userService;
    private final RefreshTokenService refreshTokenService;

    // -Registrar Nuevo Usuario
    @PostMapping("/registrar")
    public ResponseEntity<TokensDTO> registerUser(
            @Valid
            @RequestBody
            UserCreateRequest userCreateReq
    ){
        TokensDTO tokens = userService.registrarUsuario(userCreateReq);
        return ResponseEntity.ok(tokens);
    }

    // Iniciar Sesion Usuario
    @PostMapping("/login")
    public ResponseEntity<TokensDTO> loginUsuario(
            @Valid
            @RequestBody
            LoginRequest usuarioLogDTO
    ){
        TokensDTO tokens = userService.loginUsuario(usuarioLogDTO);
        return ResponseEntity.ok(tokens);
    }

    // -Refrescar el Access Token
    @PostMapping("/reflesh")
    public ResponseEntity<TokensDTO> refleshToken(
            @Valid
            @RequestBody
            TokenRequest refleshToken
    ){
            TokensDTO accessToken = refreshTokenService.refrescarAccessToken(refleshToken);
            return ResponseEntity.ok(accessToken);
    }

    // -Invalidar Tokens
    @PostMapping("/invalidacion")
    public ResponseEntity<Void> logoutUser(
            @RequestParam
            Long userId
    ){
        refreshTokenService.revokeAllTokensForUser(userId);
        return ResponseEntity.ok().build();
    }

    // -Validar Tokens
    @PostMapping("/validacion")
    public ResponseEntity<Boolean> validateToken(
            @RequestBody
            TokenRequest token
    ){
        boolean valido = refreshTokenService.validateRefreshToken(token.getToken()).isPresent();
        return ResponseEntity.ok(valido);
    }
}
