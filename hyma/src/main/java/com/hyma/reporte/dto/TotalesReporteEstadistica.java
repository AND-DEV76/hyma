package com.hyma.reporte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TotalesReporteEstadistica {
    private int totalDiasAtencion;
    private Double promedioDiarioAtencion;
    private int nuevos;
    private int reconsulta;
    private int totalPacientes;

    private int edad0a5;
    private int edad6a12;
    private int edad13a17;
    private int edad18a59;
    private int edad60mas;
    private int totalEdades;

    private int femenino;
    private int masculino;
    private int totalGenero;

    private BigDecimal totalRecaudado;
    private List<Integer> diagnosticos;
}
