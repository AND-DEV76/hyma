package com.hyma.recepcion.service;

public class PacienteYaEnColaException extends RuntimeException {

    public PacienteYaEnColaException(Long idPaciente) {
        super("El paciente con ID " + idPaciente +
                " ya se encuentra en una cola de atención activa.");
    }
}