package com.mito.sismo.service;

import com.mito.sismo.repository.FasePrevencionRepository;
import org.springframework.stereotype.Service;

@Service
public class FasePrevencionService {

    private final FasePrevencionRepository fasePrevencionRepository;

    public FasePrevencionService(FasePrevencionRepository fasePrevencionRepository){
        this.fasePrevencionRepository = fasePrevencionRepository;
    }

}
