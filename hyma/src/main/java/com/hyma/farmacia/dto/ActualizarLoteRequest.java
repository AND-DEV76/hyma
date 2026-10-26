package com.hyma.farmacia.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarLoteRequest {

    private String numeroLote;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    private LocalDate fechaExpiracion;

    @NotNull(message = "Las unidades / cantidad son obligatorias")
    private Integer cantidad; // stock disponible / cantidadInicial

    @NotNull(message = "El costo unitario es obligatorio")
    private BigDecimal precioUnitario; // Costo Unitario (Q)
}
