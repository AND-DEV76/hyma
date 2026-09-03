package com.hyma.farmacia.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoteResponse {
    private Long idLote;
    private Long idMedicamento;
    private String medicamentoNombre;
    private String presentacion;
    private String numeroLote;
    private LocalDate fechaExpiracion;
    private BigDecimal precioUnitario;
    private Integer cantidadInicial;
    private Integer stockDisponible;
    private String estado;
}
