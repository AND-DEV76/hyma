package com.hyma.clinica.model;

import com.hyma.consulta.model.Consulta;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "receta_externa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecetaExterna {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_receta_externa")
    private Long idRecetaExterna;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_consulta", nullable = false, foreignKey = @ForeignKey(name = "fk_receta_externa_consulta"))
    private Consulta consulta;

    @Column(name = "nombre_medicamento", nullable = false, length = 255)
    private String nombreMedicamento;

    @Column(name = "presentacion", length = 150)
    private String presentacion;

    @Column(name = "dosis", length = 150)
    private String dosis;

    @Column(name = "frecuencia", length = 100)
    private String frecuencia;

    @Column(name = "duracion", length = 100)
    private String duracion;

    @Column(name = "cantidad")
    @Builder.Default
    private Integer cantidad = 1;

    @Column(name = "tipo", nullable = false, length = 50)
    private String tipo; // EXTERNO_NO_CATALOGO o NO_DISPENSADO_FARMACIA

    @Column(name = "motivo", length = 255)
    private String motivo;

    @Column(name = "fecha_registro")
    @Builder.Default
    private LocalDateTime fechaRegistro = LocalDateTime.now();
}
