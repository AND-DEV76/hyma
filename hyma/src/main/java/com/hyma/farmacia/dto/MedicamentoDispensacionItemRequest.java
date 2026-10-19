package com.hyma.farmacia.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentoDispensacionItemRequest {
    private Long idMedicamento;
    private String dosis;
    private String frecuencia;
    private String duracion;
    private Integer cantidad;
}
