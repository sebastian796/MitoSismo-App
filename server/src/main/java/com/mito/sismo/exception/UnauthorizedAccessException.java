package com.mito.sismo.exception;

public class UnauthorizedAccessException extends RuntimeException {
    public UnauthorizedAccessException() {
        super("La misión solicitada no pertenece al usuario autenticado.");
    }
}
