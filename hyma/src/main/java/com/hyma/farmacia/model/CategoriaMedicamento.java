package com.hyma.farmacia.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categoria_medicamento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoriaMedicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria_medicamento")
    private Long idCategoriaMedicamento;

    @Column(name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre;
}
