package com.hyma.reporte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiagnosticoColumnaInfo {
    private int indice;
    private Long idCie10;
    private String codigo;
    private String categoria;
    private String nombre;
    private String colorFondo;
}
