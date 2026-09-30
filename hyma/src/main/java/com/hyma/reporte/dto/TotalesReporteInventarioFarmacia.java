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
public class TotalesReporteInventarioFarmacia {
    private int totalMedicamentos;
    private int sumFisicoMesAnterior;
    private int sumPedidosCompras;
    private int sumDonaciones;
    private int sumFisicoParaElMes;
    private int sumSemana1;
    private int sumSemana2;
    private int sumSemana3;
    private int sumSemana4;
    private int sumMedicamentoVencido;
    private int sumTotalEntregado;
    private int sumSaldoActual;
    private int sumInventarioFisico;
    private int sumDiferencia;
    private BigDecimal sumTotal;
    private BigDecimal sumValorTotalInventario;
}
