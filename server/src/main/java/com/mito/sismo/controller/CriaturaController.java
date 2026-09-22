package com.mito.sismo.controller;

import com.mito.sismo.service.CriaturaService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/criatura")
public class CriaturaController {

    private final CriaturaService criaturaService;

    public CriaturaController(CriaturaService criaturaService){
        this.criaturaService = criaturaService;
    }

}
