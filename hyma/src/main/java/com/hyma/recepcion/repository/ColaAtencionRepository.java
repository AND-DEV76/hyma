package com.hyma.recepcion.repository;

import com.hyma.recepcion.model.ColaAtencion;
import com.hyma.recepcion.model.EstadoCola;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ColaAtencionRepository extends JpaRepository<ColaAtencion, Long> {

    List<ColaAtencion> findAllByOrderByFechaIngresoAsc();

    List<ColaAtencion> findByEstadoOrderByFechaIngresoAsc(EstadoCola estado);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM ColaAtencion c WHERE c.estado = :estado ORDER BY COALESCE(c.fechaAtencion, c.fechaIngreso) ASC")
    List<ColaAtencion> findByEstadoOrdenadoPorSalida(@org.springframework.data.repository.query.Param("estado") EstadoCola estado);

    boolean existsByPaciente_IdPacienteAndEstadoIn(
        Long idPaciente,
        Collection<EstadoCola> estados
    );
}