package com.mito.sismo.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Credenciales inválidas. Verifique su email y contraseña");
    }
}