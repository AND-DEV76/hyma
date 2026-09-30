package com.hyma.reporte.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FilaReporteInventarioFarmacia {
    private Long idMedicamento;
    private Long idLote;
    private String numeroLote;
    private String fechaExpiracion;          // Ej. "nov-27"
    private String fechaExpiracionCompleta;  // Ej. "30/11/2027"
    private String nombre;                   // Nombre del medicamento
    private String presentacion;             // Ej. "Gotero 100mg/1ml"
    private String casaFarmaceutica;         // Ej. "Selectpharma"
    private Integer totalFisicoMesAnterior;  // Saldo físico mes previo
    private Integer pedidosCompras;          // Entradas COMPRA / PEDIDO
    private Integer donaciones;              // Entradas DONACION
    private Integer totalFisicoParaElMes;    // Mes Anterior + Pedidos + Donaciones
    private Integer semana1;                 // Salidas días 1-7
    private Integer semana2;                 // Salidas días 8-14
    private Integer semana3;                 // Salidas días 15-21
    private Integer semana4;                 // Salidas días 22 al final del mes
    private Integer medicamentoVencido;      // Bajas por vencimiento
    private Integer totalEntregado;          // Semana 1..4
    private Integer saldoActual;             // Físico mes - Entregado - Vencido
    private Integer inventarioFisico;        // Conteo físico auditoría
    private Integer diferencia;              // Saldo Actual - Inventario Físico (0)
    private BigDecimal precioPorUnidad;      // Precio / costo unitario
    private BigDecimal total;                // Diferencia * Precio (0.00)
    private BigDecimal valorSaldoActual;     // Saldo Actual * Precio
}
