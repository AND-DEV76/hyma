package com.hyma.farmacia.repository;

import com.hyma.farmacia.model.EntradaMedicamento;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EntradaMedicamentoRepository extends JpaRepository<EntradaMedicamento, Long> {

    @Query("""
        select distinct e from EntradaMedicamento e
        left join fetch e.usuario
        left join fetch e.detalles d
        left join fetch d.lote l
        left join fetch l.medicamento
        order by e.fechaEntrada desc
        """)
    List<EntradaMedicamento> buscarTodas();

    @Query("""
        select distinct e from EntradaMedicamento e
        left join fetch e.usuario
        left join fetch e.detalles d
        left join fetch d.lote l
        left join fetch l.medicamento
        where e.fechaEntrada >= :desde and e.fechaEntrada < :hasta
        order by e.fechaEntrada desc
        """)
    List<EntradaMedicamento> buscarPorRango(
            @Param("desde") LocalDateTime desde,
            @Param("hasta") LocalDateTime hasta
    );

    long countByFechaEntradaBetween(LocalDateTime desde, LocalDateTime hasta);
}
