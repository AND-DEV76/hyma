package com.hyma.recepcion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import com.hyma.alergia.model.Alergia;

@Entity
@Table(name = "paciente")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paciente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paciente")
    private Long idPaciente;

    @Column(name = "nombres", nullable = false, length = 100)
    private String nombres;

    @Column(name = "apellidos", nullable = false, length = 100)
    private String apellidos;

    @Column(name = "fecha_nacimiento", nullable = false)
    private LocalDate fechaNacimiento;

    @Enumerated(EnumType.STRING)
    @Column(name = "sexo", nullable = false, columnDefinition = "CHAR(1)")
    private Sexo sexo;

    @Column(name = "telefono", length = 20)
    private String telefono;

    @Column(name = "comunidad", length = 150)
    private String comunidad;

    @Column(name = "fecha_registro")
    private LocalDateTime fechaRegistro;

    @Column(name = "antecedentes_personales_patologicos")
    private String antecedentesPersonalesPatologicos;

    @Column(name = "antecedentes_personales_familiares")
    private String antecedentesPersonalesFamiliares;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "paciente_alergia",
        joinColumns = @JoinColumn(name = "id_paciente"),
        inverseJoinColumns = @JoinColumn(name = "id_alergia")
    )
    @Builder.Default
    private Set<Alergia> alergias = new HashSet<>();

    @PrePersist
    protected void prePersist() {
        if (fechaRegistro == null) {
            fechaRegistro = LocalDateTime.now();
        }
    }
}