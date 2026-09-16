package com.hyma.farmacia.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecetaDispensacionResponse {
    private Long idCola;
    private Long idPaciente;
    private String nombreCompletoPaciente;
    private Integer edad;
    private String sexo;
    private String comunidad;
    private Long idConsulta;
    private LocalDateTime fechaConsulta;
    private String nombreMedico;
    private String observacionesTratamiento;

    @Builder.Default
    private BigDecimal precioConsulta = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal totalMedicamentos = BigDecimal.ZERO;
    @Builder.Default
    private BigDecimal totalPagar = BigDecimal.ZERO;

    @Builder.Default
    private List<DetalleDispensacionResponse> medicamentos = new ArrayList<>();
    @Builder.Default
    private List<LoteSugeridoResponse> lotesSugeridos = new ArrayList<>();
}
