package com.hyma.recepcion.dto;

import com.hyma.recepcion.model.EstadoCola;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColaAtencionResponse {

    private Long idCola;

    private Long idPaciente;

    private String nombresPaciente;

    private String apellidosPaciente;

    private LocalDateTime fechaIngreso;

    private EstadoCola estado;

    private Integer prioridad;

    private LocalDateTime fechaAtencion;
}