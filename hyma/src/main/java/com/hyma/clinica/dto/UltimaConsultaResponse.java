package com.hyma.clinica.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UltimaConsultaResponse {
    private Long idConsulta;
    private LocalDateTime fechaConsulta;
    private String medico;
    private String especialidadMedico;
    private String motivoConsulta;
    private String historiaEnfermedadActual;
    private String impresionClinica;
    private String planMedico;
    
    private List<DiagnosticoItemResponse> diagnosticos;
    private String indicacionesTratamiento;
    private List<MedicamentoRecetadoItemResponse> medicamentos;
    private ExamenFisicoItemResponse examenFisico;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DiagnosticoItemResponse {
        private String codigoCie10;
        private String descripcion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MedicamentoRecetadoItemResponse {
        private String medicamento;
        private String presentacion;
        private String concentracion;
        private String dosis;
        private String frecuencia;
        private String duracion;
        private Integer cantidad;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ExamenFisicoItemResponse {
        private String piel;
        private String conciencia;
        private String cardiopulmonar;
        private String abdomen;
        private String soma;
    }
}
