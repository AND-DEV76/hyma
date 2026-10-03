package com.hyma.social.dto;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardReferenciasResponse {
    private Integer anio;
    private Integer mes;
    private String nombreMes;
    private Long totalReferencias;
    private List<FilaEspecialidadReferencia> filas;
}
