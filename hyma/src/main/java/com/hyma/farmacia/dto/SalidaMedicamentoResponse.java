package com.hyma.farmacia.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalidaMedicamentoResponse {
    private Long idSalida;
    private Long idConsulta;
    private Long idPaciente;
    private String pacienteNombre;
    private String medicoNombre;
    private String usuarioNombre;
    private LocalDateTime fechaSalida;
    private String tipoSalida;
    private String observaciones;
    private BigDecimal costoConsulta;
    private BigDecimal totalMedicamentos;
    private List<DetalleSalidaMedicamentoResponse> detalles;
}