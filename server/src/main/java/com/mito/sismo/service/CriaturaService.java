package com.mito.sismo.service;

import com.mito.sismo.repository.CriaturaRepository;
import org.springframework.stereotype.Service;

@Service
public class CriaturaService {
    private final CriaturaRepository criaturaRepository;

    public CriaturaService(CriaturaRepository criaturaRepository){
        this.criaturaRepository = criaturaRepository;
    }
}
