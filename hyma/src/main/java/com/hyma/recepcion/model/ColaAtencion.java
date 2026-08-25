package com.hyma.recepcion.model;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "cola_atencion")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ColaAtencion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cola")
    private Long idCola;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "id_paciente",
        nullable = false,
        foreignKey = @ForeignKey(name = "fk_cola_atencion_paciente")
    )
    private Paciente paciente;

    @Column(name = "fecha_ingreso")
    private LocalDateTime fechaIngreso;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, length = 30)
    private EstadoCola estado;

    @Column(name = "prioridad")
    private Integer prioridad;

    @Column(name = "fecha_atencion")
    private LocalDateTime fechaAtencion;

    @PrePersist
    protected void prePersist() {
        if (fechaIngreso == null) {
            fechaIngreso = LocalDateTime.now();
        }

        if (estado == null) {
            estado = EstadoCola.PENDIENTE;
        }

        if (prioridad == null) {
            prioridad = 0;
        }
    }
}