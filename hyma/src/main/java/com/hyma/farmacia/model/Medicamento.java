package com.hyma.farmacia.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "medicamento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_medicamento")
    private Long idMedicamento;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria_medicamento")
    private CategoriaMedicamento categoria;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_casa_farmaceutica")
    private CasaFarmaceutica casaFarmaceutica;

    @Column(name = "nombre", nullable = false, length = 150)
    private String nombre;

    @Column(name = "presentacion", length = 100)
    private String presentacion;

    @Column(name = "concentracion", length = 100)
    private String concentracion;

    @Column(name = "estado", nullable = false)
    @Builder.Default
    private Boolean estado = true;
}
