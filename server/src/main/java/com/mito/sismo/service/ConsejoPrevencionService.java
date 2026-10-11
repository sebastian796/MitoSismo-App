package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.ConsejoPrevencionDTO;
import com.mito.sismo.dto.entidades.ContactoEmergenciaDTO;
import com.mito.sismo.entity.ConsejoPrevencion;
import com.mito.sismo.entity.ContactoEmergencia;
import com.mito.sismo.entity.FasePrevencion;
import com.mito.sismo.entity.enums.ClaveFase;
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

    private final ConsejoPrevencionRepository consejoPrevenRepo;
    private final FasePrevencionRepository fasePrevencionRepository;

   // -Traer Consejos
    @Transactional(readOnly = true)
    public List<ConsejoPrevencionDTO> listConsejos(){
        return consejoPrevenRepo.findAll().stream()
                .map(ConsejoPrevencionDTO::fromEntity).collect(Collectors.toList());
    }

    // -Traer Consejos Antes
    @Transactional(readOnly = true)
    public List<ConsejoPrevencionDTO> listConsejoAntes(){
        return consejoPrevenRepo.findAll().stream()
                .filter(consejo -> consejo.getFase().getClave() == ClaveFase.ANTES)
                .map(ConsejoPrevencionDTO::fromEntity).collect(Collectors.toList());
    }

    // -Traer Consejos Durante
    @Transactional(readOnly = true)
    public List<ConsejoPrevencionDTO> listConsejoDurante(){
        return consejoPrevenRepo.findAll().stream()
                .filter(consejo -> consejo.getFase().getClave() == ClaveFase.DURANTE)
                .map(ConsejoPrevencionDTO::fromEntity).collect(Collectors.toList());
    }

    // -Traer Consejos Despues
    @Transactional(readOnly = true)
    public List<ConsejoPrevencionDTO> listConsejoDespues(){
        return consejoPrevenRepo.findAll().stream()
                .filter(consejo -> consejo.getFase().getClave() == ClaveFase.DESPUES)
                .map(ConsejoPrevencionDTO::fromEntity).collect(Collectors.toList());
    }

}
