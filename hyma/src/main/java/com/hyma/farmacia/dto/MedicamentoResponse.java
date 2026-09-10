package com.hyma.farmacia.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentoResponse {
    private Long idMedicamento;
    private Long idCategoriaMedicamento;
    private String categoriaNombre;
    private Long idCasaFarmaceutica;
    private String casaFarmaceuticaNombre;
    private String nombre;
    private String presentacion;
    private String concentracion;
    private Boolean estado;
    private Integer unidades;
    private BigDecimal precio;
    private LocalDate proximoVencimiento;
}
