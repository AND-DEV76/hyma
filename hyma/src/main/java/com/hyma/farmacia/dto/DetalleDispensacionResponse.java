package com.hyma.farmacia.dto;

import lombok.*;

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
}
