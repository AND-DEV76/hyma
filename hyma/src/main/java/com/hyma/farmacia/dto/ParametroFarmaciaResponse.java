package com.hyma.farmacia.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParametroFarmaciaResponse {
    private Long idParametro;
    private String clave;
    private String valor;
    private String descripcion;
}
