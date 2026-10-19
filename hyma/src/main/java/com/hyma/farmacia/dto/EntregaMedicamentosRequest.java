package com.hyma.farmacia.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntregaMedicamentosRequest {
    private boolean noPagaConsulta;
    private boolean esCasoEspecial;
    private String modalidadCobro;
    private String observaciones;
    private List<MedicamentoDispensacionItemRequest> medicamentos;
    private List<ProcedimientoDispensacionItemRequest> procedimientos;
}
