package com.hyma.farmacia.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcedimientoDispensacionItemRequest {
    private Long idConsultaProcedimiento;
    private Long idProcedimiento;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private String instrucciones;
}
