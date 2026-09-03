package com.hyma.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DiagnosticoRequest {
    @NotBlank(message = "El código CIE-10 es obligatorio")
    private String codigoCie10;
    
    @NotBlank(message = "La descripción del diagnóstico es obligatoria")
    private String descripcion;
}
