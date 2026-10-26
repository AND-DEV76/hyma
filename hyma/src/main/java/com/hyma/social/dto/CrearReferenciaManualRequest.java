package com.hyma.social.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrearReferenciaManualRequest {

    @NotNull(message = "El ID del paciente es obligatorio")
    private Long idPaciente;

    @NotNull(message = "La especialidad es obligatoria")
    private Long idEspecialidad;

    private Long idConsulta; // Opcional: si es nulo se toma la última consulta del paciente

    private Long idMedico; // Opcional: si es nulo se toma el médico de la consulta

    @Size(max = 300, message = "El motivo de referencia no puede superar los 300 caracteres")
    private String motivoReferencia;
}
