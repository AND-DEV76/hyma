package com.hyma.recepcion.service;

public class AlergiaNotFoundException extends RuntimeException {

    public AlergiaNotFoundException(Long id) {
        super("No se encontró la alergia con ID: " + id);
    }
}