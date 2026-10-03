package com.hyma.social.model;

import com.hyma.consulta.model.Consulta;
import com.hyma.doctor.model.Medico;
import com.hyma.recepcion.model.Paciente;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "referencia_medica")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReferenciaMedica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_referencia")
    private Long idReferencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_consulta", nullable = false, foreignKey = @ForeignKey(name = "fk_referencia_consulta"))
    private Consulta consulta;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_paciente", nullable = false, foreignKey = @ForeignKey(name = "fk_referencia_paciente"))
    private Paciente paciente;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_especialidad", nullable = false, foreignKey = @ForeignKey(name = "fk_referencia_especialidad"))
    private EspecialidadReferencia especialidad;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_medico", nullable = false, foreignKey = @ForeignKey(name = "fk_referencia_medico"))
    private Medico medico;

    @Column(name = "fecha_referencia", nullable = false)
    private LocalDateTime fechaReferencia;

    @Column(name = "motivo_referencia", columnDefinition = "TEXT")
    private String motivoReferencia;

    @PrePersist
    protected void prePersist() {
        if (fechaReferencia == null) {
            fechaReferencia = LocalDateTime.now();
        }
    }
}
