package com.hyma.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CatalogoCie10Request {
    @NotBlank(message = "El código es obligatorio")
    private String codigo;
    
    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;
}
