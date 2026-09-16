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
public class FilaReporteEstadistica {
    private String fecha;               // Ej. "02/02/2026"
    private int numeroDia;             // Día del mes (1..31)
    private Integer diasAtencion;       // 1 si hubo atencion
    private int nuevos;
    private int reconsulta;
    private int totalPacientes;        // nuevos + reconsulta

    // Grupos de edad
    private int edad0a5;
    private int edad6a12;
    private int edad13a17;
    private int edad18a59;
    private int edad60mas;
    private int totalEdades;           // suma grupos edad

    // Género
    private int femenino;
    private int masculino;
    private int totalGenero;           // suma F + M

    // Recaudación
    private BigDecimal totalRecaudado;

    // Diagnósticos (array o lista de 52 conteos)
    private List<Integer> diagnosticos;
}
