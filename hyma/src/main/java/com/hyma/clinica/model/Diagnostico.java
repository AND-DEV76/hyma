package com.hyma.clinica.model;

import com.hyma.consulta.model.Consulta;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "diagnostico")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Diagnostico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_diagnostico")
    private Long idDiagnostico;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_consulta", nullable = false, foreignKey = @ForeignKey(name = "fk_diagnostico_consulta"))
    private Consulta consulta;

    @Column(name = "codigo_cie10", length = 70)
    private String codigoCie10;

    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    private CategoriaDiagnostico categoria;
}
