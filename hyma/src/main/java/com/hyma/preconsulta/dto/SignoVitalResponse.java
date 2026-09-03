package com.hyma.preconsulta.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO con los detalles de los signos vitales registrados.
 * Incluye cálculo de IMC y datos descriptivos del paciente.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignoVitalResponse {

    private Long idSignoVital;
    private Long idPaciente;
    private String nombreCompletoPaciente;
    private Long idConsulta;

    private BigDecimal peso;
    private BigDecimal talla;
    private String presionArterial;
    private BigDecimal glicemia;
    private Integer frecuenciaCardiaca;
    private Integer frecuenciaRespiratoria;
    private BigDecimal saturacionOxigeno;
    private BigDecimal temperatura;

    /** Índice de Masa Corporal calculado (IMC) */
    private BigDecimal imc;
    /** Clasificación del IMC (Bajo peso, Normal, Sobrepeso, Obesidad) */
    private String clasificacionImc;

    private LocalDateTime fechaRegistro;
}

