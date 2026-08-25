package com.hyma.recepcion.dto;

import com.hyma.recepcion.model.Sexo;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteResumenResponse {

    private Long idPaciente;

    private String nombres;

    private String apellidos;

    private LocalDate fechaNacimiento;

    private Sexo sexo;

    private String telefono;

    private String comunidad;
}