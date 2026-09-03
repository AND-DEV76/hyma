package com.hyma.exception;

public class ConsultaNotFoundException extends RuntimeException {
    public ConsultaNotFoundException(Long id) {
        super("Consulta no encontrada con ID: " + id);
    }
    public ConsultaNotFoundException(String message) {
        super(message);
    }
}
