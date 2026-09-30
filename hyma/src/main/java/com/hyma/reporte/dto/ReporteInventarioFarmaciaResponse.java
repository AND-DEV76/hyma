package com.hyma.reporte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReporteInventarioFarmaciaResponse {
    private int anio;
    private int mes;
    private String nombreMes;
    private List<FilaReporteInventarioFarmacia> filas;
    private TotalesReporteInventarioFarmacia totales;
}
