package com.hyma.farmacia.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConsumoClinicaResponse {
    private Long idSalida;
    private Long idMedicamento;
    private String medicamentoNombre;
    private String presentacion;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal total;
    private String usuarioNombre;
    private LocalDateTime fechaSalida;
    private String observaciones;
}
