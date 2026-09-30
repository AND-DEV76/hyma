package com.hyma.farmacia.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VentaExternaRequest {

    private String cliente;
    private String observaciones;

    @NotEmpty(message = "Debe incluir al menos un medicamento para la venta")
    private List<ItemVentaExternaRequest> items;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemVentaExternaRequest {
        private Long idMedicamento;
        private Integer cantidad;
        private BigDecimal precioUnitario;
    }
}
