package com.hyma.farmacia.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntregaMedicamentosRequest {
    private boolean noPagaConsulta;
    private String observaciones;
}
