package com.hyma.farmacia.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "casa_farmaceutica")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CasaFarmaceutica {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_casa_farmaceutica")
    private Long idCasaFarmaceutica;

    @Column(name = "nombre", nullable = false, unique = true, length = 150)
    private String nombre;
}
