package com.hyma.recepcion.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColaAtencionCreateRequest {

    @NotNull(message = "El paciente es obligatorio")
    private Long idPaciente;

    @Min(value = 0, message = "La prioridad no puede ser negativa")
    private Integer prioridad;
}