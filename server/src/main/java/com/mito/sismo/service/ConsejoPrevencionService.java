package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.ConsejoPrevencionDTO;
import com.mito.sismo.entity.ConsejoPrevencion;
import com.mito.sismo.entity.FasePrevencion;
import com.mito.sismo.exception.ResourceNotFoundException;
import com.mito.sismo.repository.ConsejoPrevencionRepository;
import com.mito.sismo.repository.FasePrevencionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para la gestión de consejos de prevención individualizados por fase.
 */
@Service
@RequiredArgsConstructor
public class ConsejoPrevencionService {

    private final ConsejoPrevencionRepository consejoPrevencionRepository;
    private final FasePrevencionRepository fasePrevencionRepository;

    // Listar todos los consejos pertenecientes a una fase
    @Transactional(readOnly = true)
    public List<ConsejoPrevencionDTO> listarPorFase(Integer faseId) {
        return consejoPrevencionRepository.findByFaseIdOrderByOrdenAsc(faseId).stream()
                .map(ConsejoPrevencionDTO::fromEntity)
                .collect(Collectors.toList());
    }

    // Obtener un consejo por ID
    @Transactional(readOnly = true)
    public ConsejoPrevencionDTO obtenerPorId(Integer id) {
        ConsejoPrevencion consejo = consejoPrevencionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consejo de prevención no encontrado con ID: " + id));
        return ConsejoPrevencionDTO.fromEntity(consejo);
    }

    // Registrar un nuevo consejo en una fase
    @Transactional
    public ConsejoPrevencionDTO crearConsejo(ConsejoPrevencionDTO dto) {
        FasePrevencion fase = fasePrevencionRepository.findById(dto.getFaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Fase no encontrada con ID: " + dto.getFaseId()));

        ConsejoPrevencion nuevo = ConsejoPrevencion.builder()
                .fase(fase)
                .consejo(dto.getConsejo())
                .orden(dto.getOrden() != null ? dto.getOrden() : 0)
                .build();

        return ConsejoPrevencionDTO.fromEntity(consejoPrevencionRepository.save(nuevo));
    }

    // Actualizar un consejo existente
    @Transactional
    public ConsejoPrevencionDTO actualizarConsejo(Integer id, ConsejoPrevencionDTO dto) {
        ConsejoPrevencion existente = consejoPrevencionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consejo de prevención no encontrado con ID: " + id));

        existente.setConsejo(dto.getConsejo());
        if (dto.getOrden() != null) {
            existente.setOrden(dto.getOrden());
        }

        return ConsejoPrevencionDTO.fromEntity(consejoPrevencionRepository.save(existente));
    }

    // Eliminar un consejo
    @Transactional
    public void eliminarConsejo(Integer id) {
        if (!consejoPrevencionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Consejo de prevención no encontrado con ID: " + id);
        }
        consejoPrevencionRepository.deleteById(id);
    }
}
