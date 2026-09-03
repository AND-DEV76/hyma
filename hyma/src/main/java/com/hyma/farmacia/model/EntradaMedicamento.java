package com.hyma.farmacia.model;

import com.hyma.usuario.model.Usuario;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "entrada_medicamento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EntradaMedicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrada")
    private Long idEntrada;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @CreationTimestamp
    @Column(name = "fecha_entrada", updatable = false)
    private LocalDateTime fechaEntrada;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_entrada", nullable = false, length = 50)
    private TipoEntrada tipoEntrada;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @OneToMany(mappedBy = "entrada", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DetalleEntradaMedicamento> detalles = new ArrayList<>();
}
