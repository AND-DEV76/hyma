package com.hyma.social.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferenciaMedicaResponse {
    private Long idReferencia;
    private Long idConsulta;
    private Long idPaciente;
    private Long idEspecialidad;
    private String nombreEspecialidad;
    private String motivoReferencia;
    private LocalDateTime fechaReferencia;
}
