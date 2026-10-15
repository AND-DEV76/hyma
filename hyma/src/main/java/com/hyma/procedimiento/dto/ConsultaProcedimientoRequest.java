package com.hyma.procedimiento.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaProcedimientoRequest {

    @NotNull(message = "El idProcedimiento es obligatorio")
    private Long idProcedimiento;

    @Min(value = 1, message = "La cantidad debe ser al menos 1")
    @Builder.Default
    private Integer cantidad = 1;

    private BigDecimal precioUnitario;

    private String instrucciones;
}
