package com.mito.sismo.service;

import com.mito.sismo.dto.entidades.ContactoEmergenciaDTO;
import com.mito.sismo.repository.ContactoEmergenciaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NumeroEmergenciaService {

    private final ContactoEmergenciaRepository contacEmergRepo;


    // -Traer Lista de Emergencia
    @Transactional(readOnly = true)
    public List<ContactoEmergenciaDTO> traerListContacto(){
        return contacEmergRepo.findAll().stream()
                .map(ContactoEmergenciaDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
