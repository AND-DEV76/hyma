package com.hyma.social.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CentroReferenciaResponse {
    private Long idCentroReferencia;
    private Long idEspecialidad;
    private String nombreEspecialidad;
    private String institucion;
    private String nombreMedico;
    private BigDecimal precioConsulta;
    private String direccion;
    private String diasAtencion;
    private String telefono;
    private Boolean activo;
}
