package com.mito.sismo.controller;

import com.mito.sismo.service.FasePrevencionService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/prevencion")
public class FasePrevencionController {

    private final FasePrevencionService fasePrevencionService;

    public FasePrevencionController(FasePrevencionService fasePrevencionService){
        this.fasePrevencionService = fasePrevencionService;
    }

}
