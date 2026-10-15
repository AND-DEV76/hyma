package com.hyma.procedimiento.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcedimientoDTO {
    private Long idProcedimiento;
    private String nombre;
    private BigDecimal precio;
    private Boolean activo;
}
