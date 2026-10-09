package com.mito.sismo.controller;

import com.mito.sismo.dto.entidades.ConsejoPrevencionDTO;
import com.mito.sismo.service.ConsejoPrevencionService;
import com.mito.sismo.service.FasePrevencionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prevencion")
@RequiredArgsConstructor
public class FasePrevencionController {

    private final FasePrevencionService fasePrevencionService;
    private final ConsejoPrevencionService consejoPrevencionService;

    // --- Endpoints para Consejos de Prevención ---

    @GetMapping("/fases/{faseId}/consejos")
    public ResponseEntity<List<ConsejoPrevencionDTO>> listarConsejosPorFase(@PathVariable Integer faseId) {
        return ResponseEntity.ok(consejoPrevencionService.listarPorFase(faseId));
    }

    @GetMapping("/consejos/{id}")
    public ResponseEntity<ConsejoPrevencionDTO> obtenerConsejoPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(consejoPrevencionService.obtenerPorId(id));
    }

    @PostMapping("/consejos")
    public ResponseEntity<ConsejoPrevencionDTO> crearConsejo(@RequestBody ConsejoPrevencionDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(consejoPrevencionService.crearConsejo(dto));
    }

    @PutMapping("/consejos/{id}")
    public ResponseEntity<ConsejoPrevencionDTO> actualizarConsejo(
            @PathVariable Integer id,
            @RequestBody ConsejoPrevencionDTO dto) {
        return ResponseEntity.ok(consejoPrevencionService.actualizarConsejo(id, dto));
    }

    @DeleteMapping("/consejos/{id}")
    public ResponseEntity<Void> eliminarConsejo(@PathVariable Integer id) {
        consejoPrevencionService.eliminarConsejo(id);
        return ResponseEntity.noContent().build();
    }
}
