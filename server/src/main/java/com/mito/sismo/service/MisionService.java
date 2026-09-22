package com.mito.sismo.service;

import com.mito.sismo.repository.MisionRepository;
import org.springframework.stereotype.Service;

@Service
public class MisionService {

    private final MisionRepository misionRepository;

    public MisionService(MisionRepository misionRepository){
        this.misionRepository = misionRepository;
    }
}
