package com.hyma.clinica.model;

import com.hyma.farmacia.model.Medicamento;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "detalle_tratamiento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleTratamiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_tratamiento")
    private Long idDetalleTratamiento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_tratamiento", nullable = false, foreignKey = @ForeignKey(name = "fk_detalle_tratamiento_tratamiento"))
    private Tratamiento tratamiento;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_medicamento", nullable = false, foreignKey = @ForeignKey(name = "fk_detalle_tratamiento_medicamento"))
    private Medicamento medicamento;

    @Column(name = "dosis", length = 100)
    private String dosis;

    @Column(name = "frecuencia", length = 100)
    private String frecuencia;

    @Column(name = "duracion", length = 100)
    private String duracion;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;
}

