package com.hyma.farmacia.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "detalle_salida_medicamento")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleSalidaMedicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_salida")
    private Long idDetalleSalida;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_salida", nullable = false, foreignKey = @ForeignKey(name = "fk_detalle_salida"))
    private SalidaMedicamento salida;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "id_lote", nullable = false, foreignKey = @ForeignKey(name = "fk_detalle_lote"))
    private LoteMedicamento lote;

    @Column(name = "cantidad", nullable = false)
    private Integer cantidad;

    @Column(name = "precio_unitario", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal precioUnitario = BigDecimal.ZERO;

    @PrePersist
    protected void prePersist() {
        if (precioUnitario == null) {
            precioUnitario = BigDecimal.ZERO;
        }
    }
}
