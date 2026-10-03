package com.hyma.social.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpedienteSocialResponse {
    private PacienteResumenSocialResponse paciente;
    private List<ReferenciaItemSocialResponse> referencias;
    private List<ConsultaItemSocialResponse> consultas;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReferenciaItemSocialResponse {
        private Long idReferencia;
        private LocalDateTime fechaReferencia;
        private String especialidad;
        private String medico;
        private String motivoReferencia;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConsultaItemSocialResponse {
        private Long idConsulta;
        private LocalDateTime fechaConsulta;
        private String medico;
        private String motivoConsulta;
        private String historiaEnfermedadActual;
        private String impresionClinica;
        private String planMedico;
        private List<String> diagnosticos;
    }
}
