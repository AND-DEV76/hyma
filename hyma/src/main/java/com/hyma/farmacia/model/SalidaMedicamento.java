package com.hyma.farmacia.model;

import com.hyma.consulta.model.Consulta;
import com.hyma.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "salida_medicamento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalidaMedicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_salida")
    private Long idSalida;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_consulta", foreignKey = @ForeignKey(name = "fk_salida_consulta"))
    private Consulta consulta;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", foreignKey = @ForeignKey(name = "fk_salida_usuario"))
    private Usuario usuario;

    @Column(name = "fecha_salida")
    @Builder.Default
    private LocalDateTime fechaSalida = LocalDateTime.now();

    @Column(name = "tipo_salida", length = 50, nullable = false)
    @Builder.Default
    private String tipoSalida = "DISPENSACION";

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "id_tarifa")
    private Long idTarifa;

    @Column(name = "costo_consulta", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal costoConsulta = BigDecimal.ZERO;

    @PrePersist
    protected void prePersist() {
        if (fechaSalida == null) {
            fechaSalida = LocalDateTime.now();
        }
        if (costoConsulta == null) {
            costoConsulta = BigDecimal.ZERO;
        }
        if (tipoSalida == null || tipoSalida.isBlank()) {
            tipoSalida = "DISPENSACION";
        }
    }
}
