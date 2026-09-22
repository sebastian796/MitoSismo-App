package com.mito.sismo.exception;

public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException() {
        super("Acceso denegado. No tiene permisos para esta operación");
    }
}
