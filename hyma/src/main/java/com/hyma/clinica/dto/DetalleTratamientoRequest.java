package com.hyma.clinica.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DetalleTratamientoRequest {
    @NotNull(message = "El medicamento es obligatorio")
    private Long idMedicamento;
    
    private String dosis;
    private String frecuencia;
    private String duracion;
    
    @NotNull(message = "La cantidad es obligatoria")
    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    private Integer cantidad;
}
