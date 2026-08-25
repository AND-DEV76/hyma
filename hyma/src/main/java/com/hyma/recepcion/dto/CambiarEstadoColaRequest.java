package com.hyma.recepcion.dto;

import com.hyma.recepcion.model.EstadoCola;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CambiarEstadoColaRequest {

    @NotNull(message = "El estado es obligatorio")
    private EstadoCola estado;
}