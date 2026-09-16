package com.hyma.farmacia.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleDispensacionResponse {
    private Long idMedicamento;
    private String nombre;
    private String presentacion;
    private String concentracion;
    private String dosis;
    private String frecuencia;
    private String duracion;
    private Integer cantidad;
    private Integer stockDisponible;
    @Builder.Default
    private BigDecimal precioUnitario = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;
}
