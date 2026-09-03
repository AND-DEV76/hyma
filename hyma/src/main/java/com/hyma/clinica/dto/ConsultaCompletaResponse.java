package com.hyma.clinica.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ConsultaCompletaResponse {
    private Long idConsulta;
    private String mensaje;
    private LocalDateTime fechaConsulta;
}
