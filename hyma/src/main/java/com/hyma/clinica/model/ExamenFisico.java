package com.hyma.clinica.model;

import com.hyma.consulta.model.Consulta;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "examen_fisico")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExamenFisico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_examen_fisico")
    private Long idExamenFisico;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_consulta", unique = true, nullable = false, foreignKey = @ForeignKey(name = "fk_examen_fisico_consulta"))
    private Consulta consulta;

    @Column(name = "piel", columnDefinition = "TEXT")
    private String piel;

    @Column(name = "conciencia", columnDefinition = "TEXT")
    private String conciencia;

    @Column(name = "cardiopulmonar", columnDefinition = "TEXT")
    private String cardiopulmonar;

    @Column(name = "abdomen", columnDefinition = "TEXT")
    private String abdomen;

    @Column(name = "soma", columnDefinition = "TEXT")
    private String soma;
}

