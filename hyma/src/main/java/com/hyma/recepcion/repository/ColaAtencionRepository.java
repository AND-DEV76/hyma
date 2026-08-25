package com.hyma.recepcion.repository;

import com.hyma.recepcion.model.ColaAtencion;
import com.hyma.recepcion.model.EstadoCola;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Collection;
import java.util.List;

public interface ColaAtencionRepository extends JpaRepository<ColaAtencion, Long> {

    List<ColaAtencion> findAllByOrderByFechaIngresoAsc();

    List<ColaAtencion> findByEstadoOrderByFechaIngresoAsc(EstadoCola estado);

    boolean existsByPaciente_IdPacienteAndEstadoIn(
        Long idPaciente,
        Collection<EstadoCola> estados
    );
}