package com.hyma.alergia.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "alergia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alergia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alergia")
    private Long idAlergia;

    @Column(name = "nombre", nullable = false, unique = true, length = 100)
    private String nombre;
}