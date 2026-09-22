package com.mito.sismo.controller;

import com.mito.sismo.service.InsigniaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/insignia")
public class InsigniaController {

    private final InsigniaService insigniaService;
    public InsigniaController(InsigniaService insigniaService){
        this.insigniaService = insigniaService;
    }
}
