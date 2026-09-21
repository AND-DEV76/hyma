package com.hyma.farmacia.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleSalidaMedicamentoResponse {
    private Long idDetalleSalida;
    private Long idLote;
    private Long idMedicamento;
    private String medicamentoNombre;
    private String presentacion;
    private String concentracion;
    private String categoriaNombre;
    private String casaFarmaceuticaNombre;
    private String numeroLote;
    private LocalDate fechaExpiracion;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}