package com.hyma.consulta.model;

import com.hyma.doctor.model.Medico;

import com.hyma.recepcion.model.Paciente;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "consulta")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consulta")
    private Long idConsulta;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "id_paciente",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_consulta_paciente")
    )
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "id_medico",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_consulta_medico")
    )
    private Medico medico;

    @Column(name = "fecha_consulta")
    private LocalDateTime fechaConsulta;

    @Column(name = "motivo_consulta", columnDefinition = "TEXT")
    private String motivoConsulta;

    @Column(name = "historia_enfermedad_actual", columnDefinition = "TEXT")
    private String historiaEnfermedadActual;

    @Column(name = "impresion_clinica", columnDefinition = "TEXT")
    private String impresionClinica;

    @Column(name = "plan_medico", columnDefinition = "TEXT")
    private String planMedico;

    @PrePersist
    protected void prePersist() {
        if (fechaConsulta == null) {
            fechaConsulta = LocalDateTime.now();
        }
    }
}