package com.hyma.clinica.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CatalogoCie10Request {
    @NotBlank(message = "El código es obligatorio")
    @Size(max = 70, message = "El código no puede superar los 70 caracteres")
    private String codigo;
    
    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    private Long idCategoria;
}
