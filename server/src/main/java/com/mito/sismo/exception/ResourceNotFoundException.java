package com.mito.sismo.exception;

/**
 * Excepción lanzada cuando un recurso solicitado no se encuentra en el sistema.
 */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
