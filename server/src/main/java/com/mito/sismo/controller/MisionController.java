package com.mito.sismo.controller;

import com.mito.sismo.dto.CustomUserPrincipal;
import com.mito.sismo.dto.entidades.MisionDTO;
import com.mito.sismo.entity.InfoMisionDTO;
import com.mito.sismo.service.MisionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/misiones")
public class MisionController {
    private final MisionService misionService;

    // Listar todas las misiones asociadas al usuario autenticado
    @GetMapping({"", "/"})
    public ResponseEntity<List<MisionDTO>> traerListaMisiones(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = resolveUserId(principal, authHeader);
        List<MisionDTO> listaMisiones = misionService.traerListaMisiones(userId);
        return ResponseEntity.ok(listaMisiones);
    }

    @GetMapping("/completas")
    public ResponseEntity<List<MisionDTO>> getListMissionComplet(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = resolveUserId(principal, authHeader);
        List<MisionDTO> listMissionComplet = misionService.getListMissionComplet(userId);
        return ResponseEntity.ok(listMissionComplet);
    }

    // Listar todas las misiones pendientes
    @GetMapping({"/incompleta", "/incompletas"})
    public ResponseEntity<List<MisionDTO>> getListMissionIncomplet(
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = resolveUserId(principal, authHeader);
        List<MisionDTO> listMissionIncomplet = misionService.getListMissionIncomplet(userId);
        return ResponseEntity.ok(listMissionIncomplet);
    }

    // Marcar Misión como Completa
    @PostMapping("/completada")
    public ResponseEntity<InfoMisionDTO> completarMision(
            @RequestParam Long idMision,
            @AuthenticationPrincipal CustomUserPrincipal principal,
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        Long userId = resolveUserId(principal, authHeader);
        InfoMisionDTO completado = misionService.marcarCompletado(idMision, userId);
        return ResponseEntity.ok(completado);
    }

    // Catálogo público de misiones maestras
    @GetMapping("/publico")
    public ResponseEntity<List<MisionDTO>> listarCatalogoPublico() {
        return ResponseEntity.ok(misionService.listarCatalogoMisiones());
    }

    // Resuelve el ID del usuario directamente del contexto de seguridad o mediante token JWT sin consultas a BD
    private Long resolveUserId(CustomUserPrincipal principal, String authHeader) {
        if (principal != null && principal.getUserId() != null) {
            return principal.getUserId();
        }
        return misionService.extraerUserId(authHeader);
    }
}
