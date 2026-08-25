package com.hyma.recepcion.service;

public class ColaAtencionNotFoundException extends RuntimeException {

    public ColaAtencionNotFoundException(Long id) {
        super("No se encontró el registro de cola con ID: " + id);
    }
}