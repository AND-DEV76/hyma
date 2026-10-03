package com.hyma.social.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "centro_referencia")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CentroReferencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_centro_referencia")
    private Long idCentroReferencia;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_especialidad", nullable = false, foreignKey = @ForeignKey(name = "fk_centro_especialidad"))
    private EspecialidadReferencia especialidad;

    @Column(name = "institucion", length = 150)
    private String institucion;

    @Column(name = "nombre_medico", length = 150)
    private String nombreMedico;

    @Column(name = "precio_consulta", precision = 10, scale = 2, nullable = false)
    private BigDecimal precioConsulta;

    @Column(name = "direccion", length = 255, nullable = false)
    private String direccion;

    @Column(name = "dias_atencion", length = 150)
    private String diasAtencion;

    @Column(name = "telefono", length = 50)
    private String telefono;

    @Column(name = "activo", nullable = false)
    @Builder.Default
    private Boolean activo = true;
}
