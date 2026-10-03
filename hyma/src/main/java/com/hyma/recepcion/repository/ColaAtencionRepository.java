package com.hyma.recepcion.repository;

import com.hyma.recepcion.model.ColaAtencion;
import com.hyma.recepcion.model.EstadoCola;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ColaAtencionRepository extends JpaRepository<ColaAtencion, Long> {

    List<ColaAtencion> findAllByOrderByFechaIngresoAsc();
    List<ColaAtencion> findAllByOrderByPrioridadDescFechaIngresoAsc();

    List<ColaAtencion> findByEstadoOrderByFechaIngresoAsc(EstadoCola estado);
    List<ColaAtencion> findByEstadoOrderByPrioridadDescFechaIngresoAsc(EstadoCola estado);

    List<ColaAtencion> findByEstadoInOrderByFechaIngresoAsc(Collection<EstadoCola> estados);
    List<ColaAtencion> findByEstadoInOrderByPrioridadDescFechaIngresoAsc(Collection<EstadoCola> estados);

    @org.springframework.data.jpa.repository.Query("""
        SELECT c FROM ColaAtencion c
        WHERE c.estado IN :estados
        ORDER BY c.prioridad DESC,
                 CASE WHEN c.prioridad > 0 THEN COALESCE(c.fechaPrioridad, c.fechaIngreso) ELSE c.fechaIngreso END ASC,
                 c.fechaIngreso ASC
    """)
    List<ColaAtencion> findColaConsultaConPrioridad(
        @org.springframework.data.repository.query.Param("estados") Collection<EstadoCola> estados
    );

    @org.springframework.data.jpa.repository.Query("SELECT c FROM ColaAtencion c WHERE c.estado = :estado ORDER BY COALESCE(c.fechaAtencion, c.fechaIngreso) ASC")
    List<ColaAtencion> findByEstadoOrdenadoPorSalida(@org.springframework.data.repository.query.Param("estado") EstadoCola estado);

    boolean existsByPaciente_IdPacienteAndEstadoIn(
        Long idPaciente,
        Collection<EstadoCola> estados
    );
}