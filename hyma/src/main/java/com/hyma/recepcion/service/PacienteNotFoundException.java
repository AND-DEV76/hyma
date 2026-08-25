package com.hyma.recepcion.service;

public class PacienteNotFoundException extends RuntimeException {

    public PacienteNotFoundException(Long id) {
        super("No se encontró el paciente con ID: " + id);
    }
}