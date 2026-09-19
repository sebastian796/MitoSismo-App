package com.mito.sismo.controller;

import com.mito.sismo.service.MisionService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/misiones")
public class MisionController {

    private final MisionService misionService;

    public MisionController(MisionService misionService){
        this.misionService = misionService;
    }
}
