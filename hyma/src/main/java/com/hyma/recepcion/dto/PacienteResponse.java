
package com.hyma.recepcion.dto;

import com.hyma.recepcion.model.Sexo;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PacienteResponse {

    private Long idPaciente;

    private String nombres;

    private String apellidos;

    private LocalDate fechaNacimiento;

    private Sexo sexo;

    private String telefono;

    private String comunidad;

    private LocalDateTime fechaRegistro;

    private String antecedentesPersonalesPatologicos;

    private String antecedentesPersonalesFamiliares;

    private Set<Long> alergiaIds;
}