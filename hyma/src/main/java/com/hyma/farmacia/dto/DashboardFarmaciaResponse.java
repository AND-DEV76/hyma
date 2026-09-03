package com.hyma.farmacia.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardFarmaciaResponse {
    private long lotesPorVencer30Dias;
    private long lotesPorVencer60Dias;
    private long lotesPorVencer90Dias;
    private long totalMedicamentos;
    private long entradasDelMes;
    private long stockTotal;
}
