package com.hyma.clinica.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "catalogo_cie10")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogoCie10 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cie10")
    private Long idCie10;

    @Column(name = "codigo", nullable = false, unique = true, length = 70)
    private String codigo;

    @Column(name = "descripcion", nullable = false, length = 500)
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria")
    private CategoriaDiagnostico categoria;
}
