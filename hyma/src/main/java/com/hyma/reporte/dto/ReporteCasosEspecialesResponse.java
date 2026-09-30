package com.hyma.reporte.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReporteCasosEspecialesResponse {

    private int anio;
    private int mes;
    private int totalCasos;
    private BigDecimal totalMontoExonerado;
    private List<ItemCasoEspecial> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemCasoEspecial {
        private Long idSalida;
        private Long idConsulta;
        private Long idPaciente;
        private String fecha;
        private String nombrePaciente;
        private Integer edad;
        private String sexo;
        private List<String> diagnosticos;
        private List<MedicamentoItem> medicamentos;
        private BigDecimal subtotalConsulta;
        private BigDecimal subtotalMedicamentos;
        private BigDecimal totalExonerado;
        private String observaciones;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MedicamentoItem {
        private String nombre;
        private String presentacion;
        private String concentracion;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}
