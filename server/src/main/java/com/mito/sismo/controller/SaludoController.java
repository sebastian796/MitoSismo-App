package com.mito.sismo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SaludoController {
    @GetMapping("/")
    public String home() {
        return "API MitoSismo funcionando correctamente 🚀";
    }
}
