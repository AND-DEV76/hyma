package com.hyma.farmacia.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntregaMedicamentosRequest {
    private boolean noPagaConsulta;
    private boolean esCasoEspecial;
    private String observaciones;
}
