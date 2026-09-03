package com.hyma.farmacia.dto;

import com.hyma.farmacia.model.TipoEntrada;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntradaRequest {

    @NotNull(message = "El tipo de entrada es obligatorio")
    private TipoEntrada tipoEntrada;

    @Size(max = 2000, message = "Las observaciones no pueden superar 2000 caracteres")
    private String observaciones;

    @NotEmpty(message = "La entrada debe contener al menos un medicamento")
    @Valid
    private List<EntradaDetalleRequest> detalles;
}
