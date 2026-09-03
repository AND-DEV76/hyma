package com.hyma.farmacia.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntradaDetalleResponse {
    private Long idDetalleEntrada;
    private Long idLote;
    private Long idMedicamento;
    private String medicamentoNombre;
    private String numeroLote;
    private LocalDate fechaExpiracion;
    private Integer cantidad;
    private BigDecimal precioUnitario;
}
