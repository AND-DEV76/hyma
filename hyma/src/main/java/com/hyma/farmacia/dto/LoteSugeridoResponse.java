package com.hyma.farmacia.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoteSugeridoResponse {
    private Long idMedicamento;
    private String medicamentoNombre;
    private Long idLote;
    private String numeroLote;
    private LocalDate fechaVencimiento;
    private Integer stockDisponible;
    private Integer cantidadADescontar;
    private Long diasParaVencer;
    private Boolean tieneStock;
    @Builder.Default
    private BigDecimal precioUnitario = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;
}
