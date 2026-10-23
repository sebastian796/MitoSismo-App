package com.mito.sismo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class ConfiguracionConflictException extends RuntimeException {
    public ConfiguracionConflictException() {
        super("La configuración cambió. Recarga los valores antes de guardar.");
    }
}
