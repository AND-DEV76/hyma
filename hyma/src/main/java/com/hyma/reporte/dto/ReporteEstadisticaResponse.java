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
public class ReporteEstadisticaResponse {
    private int mes;
    private int anio;
    private String periodoNombre;         // Ej. "feb-26" o "Febrero 2026"
    private String titulo;                // "ESTADISTICA MENSUAL OBRAS SOCIALES SAN MARTIN"
    private List<DiagnosticoColumnaInfo> columnasDiagnosticos;
    private List<FilaReporteEstadistica> filas;
    private TotalesReporteEstadistica totales;
    private TotalesReporteEstadistica promedios;
}
