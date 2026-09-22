package com.hyma.reporte.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardHospitalarioResponse {

    private int anio;
    private int mes;
    private KpisDashboard kpis;
    private List<ItemTopDiagnostico> topDiagnosticos;
    private DemografiaDashboard demografia;
    private List<ItemTopMedicamento> topMedicamentos;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class KpisDashboard {
        private long pacientesMesTotal;
        private long pacientesNuevos;
        private long pacientesReconsulta;
        private double porcentajeNuevos;
        private double porcentajeReconsulta;

        private long atendidosHoy;
        private long enEsperaHoy;
        private long enEsperaPreconsulta;
        private long enEsperaClinica;
        private long enEsperaFarmacia;

        private BigDecimal recaudacionMesTotal;
        private BigDecimal recaudacionConsultas;
        private BigDecimal recaudacionMedicamentos;

        private long medicamentosAgotados;
        private long lotesPorVencer30Dias;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemTopDiagnostico {
        private Long idCie10;
        private String codigo;
        private String descripcion;
        private String categoria;
        private long cantidad;
        private double porcentaje;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DemografiaDashboard {
        private long totalPacientes;
        private long hombres;
        private double porcentajeHombres;
        private long mujeres;
        private double porcentajeMujeres;

        private long pediatricos;
        private double porcentajePediatricos;
        private long jovenes;
        private double porcentajeJovenes;
        private long adultos;
        private double porcentajeAdultos;
        private long adultosMayores;
        private double porcentajeAdultosMayores;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemTopMedicamento {
        private Long idMedicamento;
        private String nombre;
        private String presentacion;
        private String concentracion;
        private String categoria;
        private long unidadesDispensadas;
        private BigDecimal totalGenerado;
    }
}