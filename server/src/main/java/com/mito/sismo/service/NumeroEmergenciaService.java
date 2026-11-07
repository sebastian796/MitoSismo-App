package com.mito.sismo.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.mito.sismo.dto.entidades.ContactoEmergenciaDTO;
import com.mito.sismo.repository.ContactoEmergenciaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NumeroEmergenciaService {

    private final ContactoEmergenciaRepository contacEmergRepo;

    // -Traer Lista de Emergencia
    @Transactional(readOnly = true)
    public List<ContactoEmergenciaDTO> traerListContacto() {
        return contacEmergRepo.findAllByOrderByIdAsc().stream()
                .map(ContactoEmergenciaDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
