package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.FasePrevencionDTO;
import com.mito.sismo.entity.FasePrevencion;
import com.mito.sismo.entity.enums.ClaveFase;
import com.mito.sismo.exception.ResourceNotFoundException;
import com.mito.sismo.repository.FasePrevencionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de las fases de prevención sísmica (ANTES, DURANTE, DESPUES) y sus consejos.
 */
@Service
@RequiredArgsConstructor
public class FasePrevencionService {

    private final FasePrevencionRepository fasePrevencionRepository;

    // Listar todas las fases con sus consejos de prevención
    @Transactional(readOnly = true)
    public List<FasePrevencionDTO> listarTodas() {
        return fasePrevencionRepository.findAll().stream()
                .map(FasePrevencionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Obtener una fase por su ID numérico
    @Transactional(readOnly = true)
    public FasePrevencionDTO obtenerPorId(Integer id) {
        FasePrevencion fase = fasePrevencionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fase de prevención no encontrada con ID: " + id));
        return FasePrevencionDTO.fromEntity(fase);
    }

    // Obtener una fase por su clave enum (ANTES, DURANTE, DESPUES)
    @Transactional(readOnly = true)
    public FasePrevencionDTO obtenerPorClave(ClaveFase clave) {
        FasePrevencion fase = fasePrevencionRepository.findByClave(clave)
                .orElseThrow(() -> new ResourceNotFoundException("Fase de prevención no encontrada para clave: " + clave));
        return FasePrevencionDTO.fromEntity(fase);
    }

    // Crear una nueva fase de prevención
    @Transactional
    public FasePrevencionDTO crearFase(FasePrevencionDTO dto) {
        if (dto.getClave() != null && fasePrevencionRepository.existsByClave(dto.getClave())) {
            throw new IllegalArgumentException("Ya existe una fase de prevención con la clave: " + dto.getClave());
        }

        FasePrevencion fase = FasePrevencion.builder()
                .clave(dto.getClave())
                .titulo(dto.getTitulo())
                .icono(dto.getIcono())
                .build();

        return FasePrevencionDTO.fromEntity(fasePrevencionRepository.save(fase));
    }

    // Actualizar una fase de prevención existente
    @Transactional
    public FasePrevencionDTO actualizarFase(Integer id, FasePrevencionDTO dto) {
        FasePrevencion existente = fasePrevencionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fase de prevención no encontrada con ID: " + id));

        if (dto.getClave() != null) {
            existente.setClave(dto.getClave());
        }
        if (dto.getTitulo() != null) {
            existente.setTitulo(dto.getTitulo());
        }
        if (dto.getIcono() != null) {
            existente.setIcono(dto.getIcono());
        }

        return FasePrevencionDTO.fromEntity(fasePrevencionRepository.save(existente));
    }

    // Eliminar una fase de prevención
    @Transactional
    public void eliminarFase(Integer id) {
        if (!fasePrevencionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Fase de prevención no encontrada con ID: " + id);
        }
        fasePrevencionRepository.deleteById(id);
    }
}
