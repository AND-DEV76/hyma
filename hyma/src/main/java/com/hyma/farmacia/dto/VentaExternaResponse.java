package com.hyma.farmacia.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaExternaResponse {

    private Long idSalida;
    private LocalDateTime fechaSalida;
    private String tipoSalida;
    private String cliente;
    private String observaciones;
    private BigDecimal totalVenta;
    private List<ItemVentaExternaResponse> detalles;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemVentaExternaResponse {
        private Long idDetalleSalida;
        private Long idMedicamento;
        private String nombreMedicamento;
        private String presentacion;
        private String concentracion;
        private String numeroLote;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}
