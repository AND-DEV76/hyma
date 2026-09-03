package com.hyma.preconsulta.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para la captura de Signos Vitales en Preconsulta.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class SignoVitalCreateRequest {

    /** ID del paciente al que se le toman los signos vitales (Obligatorio) */
    @NotNull(message = "El ID del paciente es obligatorio")
    private Long idPaciente;

    /** ID del turno en cola (Opcional pero recomendado para avanzar a EN_CONSULTA) */
    @NotNull(message = "El ID de la cola es obligatorio")
    private Long idCola;

    /** Peso del paciente en kg */
    @DecimalMin(value = "0.50", message = "El peso debe ser mayor a 0.50 kg")
    @DecimalMax(value = "500.00", message = "El peso no puede exceder 500 kg")
    private BigDecimal peso;

    /** Talla o estatura del paciente en cm (ej: 165.00) */
    @DecimalMin(value = "20.00", message = "La talla debe ser mayor a 20 cm")
    @DecimalMax(value = "300.00", message = "La talla no puede exceder 300 cm")
    private BigDecimal talla;

    /** Presión arterial sistólica/diastólica (ej: 120/80) */
    private String presionArterial;

    /** Glucosa en sangre (mg/dL) */
    @DecimalMin(value = "10.00", message = "La glicemia debe ser mayor a 10 mg/dL")
    @DecimalMax(value = "1000.00", message = "La glicemia no puede exceder 1000 mg/dL")
    private BigDecimal glicemia;

    /** Frecuencia cardíaca (lpm) */
    @Min(value = 10, message = "La frecuencia cardíaca debe ser mayor o igual a 10 lpm")
    @Max(value = 300, message = "La frecuencia cardíaca no puede exceder 300 lpm")
    private Integer frecuenciaCardiaca;

    /** Frecuencia respiratoria (rpm) */
    @Min(value = 1, message = "La frecuencia respiratoria debe ser mayor o igual a 1 rpm")
    @Max(value = 100, message = "La frecuencia respiratoria no puede exceder 100 rpm")
    private Integer frecuenciaRespiratoria;

    /** Saturación de oxígeno (%) */
    @DecimalMin(value = "20.00", message = "La saturación de oxígeno debe ser mayor al 20%")
    @DecimalMax(value = "100.00", message = "La saturación de oxígeno no puede superar el 100%")
    private BigDecimal saturacionOxigeno;

    /** Temperatura corporal (°C) */
    @DecimalMin(value = "30.00", message = "La temperatura debe ser mayor a 30°C")
    @DecimalMax(value = "45.00", message = "La temperatura no puede superar 45°C")
    private BigDecimal temperatura;
}
