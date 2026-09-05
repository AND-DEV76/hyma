package com.hyma.clinica.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoriaDiagnosticoResponse {
    private Long idCategoria;
    private String nombre;
    private String descripcion;
    private Long totalDiagnosticos;
}

