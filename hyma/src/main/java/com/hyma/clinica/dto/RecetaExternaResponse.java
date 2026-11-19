package com.hyma.clinica.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecetaExternaResponse {
    private Long idRecetaExterna;
    private String nombreMedicamento;
    private String presentacion;
    private String dosis;
    private String frecuencia;
    private String duracion;
    private Integer cantidad;
    private String tipo;
    private String motivo;
    private LocalDateTime fechaRegistro;
}
