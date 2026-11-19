package com.hyma.clinica.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecetaExternaRequest {
    private String nombreMedicamento;
    private String presentacion;
    private String dosis;
    private String frecuencia;
    private String duracion;
    private Integer cantidad;
    private String tipo;
    private String motivo;
}
