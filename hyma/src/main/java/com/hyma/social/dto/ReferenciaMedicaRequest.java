package com.hyma.social.dto;

import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ReferenciaMedicaRequest {
    private Long idEspecialidad;

    @Size(max = 300, message = "El motivo de referencia no puede superar los 300 caracteres")
    private String motivoReferencia;
}
