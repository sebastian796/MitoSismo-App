package com.mito.sismo.service;

import com.mito.sismo.repository.InsigniaRepository;
import org.springframework.stereotype.Service;

@Service
public class InsigniaService {

    private final InsigniaRepository insigniaRepository;

    public InsigniaService(InsigniaRepository insigniaRepository){
        this.insigniaRepository = insigniaRepository;
    }
}
