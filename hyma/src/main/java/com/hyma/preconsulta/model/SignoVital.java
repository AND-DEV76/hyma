package com.hyma.preconsulta.model;

import com.hyma.consulta.model.Consulta;
import com.hyma.recepcion.model.Paciente;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que representa la toma de Signos Vitales de un Paciente en Preconsulta.
 * Se asocia obligatoriamente a un Paciente y puede vincularse opcionalmente
 * a una Consulta médica posterior.
 */
@Entity
@Table(name = "signo_vital")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignoVital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_signo_vital")
    private Long idSignoVital;

    /**
     * Paciente al que pertenecen los signos vitales (Obligatorio)
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "id_paciente",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_signo_vital_paciente")
    )
    private Paciente paciente;

    /**
     * Consulta médica asociada. Puede ser NULL al momento de la preconsulta,
     * y asociarse cuando el médico inicie la consulta.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "id_consulta",
        unique = true,
        foreignKey = @ForeignKey(name = "fk_signo_vital_consulta")
    )
    private Consulta consulta;

    /** Peso en Kilogramos (kg), ej: 70.50 */
    @Column(name = "peso", precision = 5, scale = 2)
    private BigDecimal peso;

    /** Talla / Estatura en Centímetros (cm), ej: 172.00 o Metros */
    @Column(name = "talla", precision = 5, scale = 2)
    private BigDecimal talla;

    /** Presión Arterial en formato sistólica/diastólica, ej: '120/80' */
    @Column(name = "presion_arterial", length = 20)
    private String presionArterial;

    /** Nivel de Glucosa / Glicemia en sangre (mg/dL), ej: 95.00 */
    @Column(name = "glicemia", precision = 6, scale = 2)
    private BigDecimal glicemia;

    /** Frecuencia Cardíaca (latidos por minuto - lpm), ej: 75 */
    @Column(name = "frecuencia_cardiaca")
    private Integer frecuenciaCardiaca;

    /** Frecuencia Respiratoria (respiraciones por minuto - rpm), ej: 18 */
    @Column(name = "frecuencia_respiratoria")
    private Integer frecuenciaRespiratoria;

    /** Saturación de Oxígeno (%), ej: 98.00 */
    @Column(name = "saturacion_oxigeno", precision = 5, scale = 2)
    private BigDecimal saturacionOxigeno;

    /** Temperatura corporal (°C), ej: 36.50 */
    @Column(name = "temperatura", precision = 4, scale = 2)
    private BigDecimal temperatura;

    /** Fecha y hora exacta en que se registraron los signos vitales */
    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @PrePersist
    protected void prePersist() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}

