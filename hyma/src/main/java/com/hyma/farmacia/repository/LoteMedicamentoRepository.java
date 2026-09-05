package com.hyma.farmacia.repository;

import com.hyma.farmacia.model.EstadoLote;
import com.hyma.farmacia.model.LoteMedicamento;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LoteMedicamentoRepository extends JpaRepository<LoteMedicamento, Long> {

    @Query("""
        select l from LoteMedicamento l
        join fetch l.medicamento m
        where (:estado is null or l.estado = :estado)
          and (:medicamentoId is null or m.idMedicamento = :medicamentoId)
          and (:hasta is null or l.fechaExpiracion <= :hasta)
        order by l.fechaExpiracion asc, m.nombre asc
        """)
    List<LoteMedicamento> buscar(
            @Param("estado") EstadoLote estado,
            @Param("medicamentoId") Long medicamentoId,
            @Param("hasta") LocalDate hasta
    );

    Optional<LoteMedicamento> findByMedicamento_IdMedicamentoAndNumeroLote(
            Long idMedicamento,
            String numeroLote
    );

    long countByEstadoAndFechaExpiracionBetween(EstadoLote estado, LocalDate desde, LocalDate hasta);

    boolean existsByMedicamento_IdMedicamento(Long idMedicamento);
}
