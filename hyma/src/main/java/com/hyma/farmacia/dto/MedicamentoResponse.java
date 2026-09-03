package com.hyma.farmacia.dto;

import lombok.*;

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
}
