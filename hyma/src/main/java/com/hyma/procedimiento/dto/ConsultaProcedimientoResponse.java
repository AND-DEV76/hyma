package com.hyma.procedimiento.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConsultaProcedimientoResponse {
    private Long idConsultaProcedimiento;
    private Long idConsulta;
    private Long idPaciente;
    private String pacienteNombreCompleto;
    private String pacienteIdentificacion;
    private Integer pacienteEdad;
    private String medicoNombreCompleto;

    private Long idProcedimiento;
    private String nombreProcedimiento;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
    private String instrucciones;
    private String estado;
    private LocalDateTime fechaRegistro;
    private LocalDateTime fechaAtencion;
    private String usuarioAtendio;
}
