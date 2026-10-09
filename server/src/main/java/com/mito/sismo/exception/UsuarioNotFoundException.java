package com.mito.sismo.exception;

/**
 * Excepción lanzada cuando un usuario específico no es encontrado.
 */
public class UsuarioNotFoundException extends RuntimeException {
    public UsuarioNotFoundException(Long id) {
        super("Usuario con ID " + id + " no encontrado");
    }

    public UsuarioNotFoundException(String message) {
        super(message);
    }
}
