package com.hyma.social.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteResumenSocialResponse {
    private Long idPaciente;
    private String nombres;
    private String apellidos;
    private String sexo;
    private LocalDate fechaNacimiento;
    private Integer edad;
    private String telefono;
    private String comunidad;
    private LocalDateTime ultimaAtencion;
    private Long totalReferencias;
}
