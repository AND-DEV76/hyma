package com.hyma.preconsulta.repository;

import com.hyma.preconsulta.model.SignoVital;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SignoVitalRepository extends JpaRepository<SignoVital, Long> {

    /**
     * Obtiene el historial completo de signos vitales de un paciente ordenados por fecha descendente.
     */
    List<SignoVital> findByPaciente_IdPacienteOrderByFechaRegistroDesc(Long idPaciente);

    /**
     * Obtiene el registro más reciente de signos vitales de un paciente.
     */
    Optional<SignoVital> findFirstByPaciente_IdPacienteOrderByFechaRegistroDesc(Long idPaciente);

    /**
     * Obtiene los signos vitales vinculados a una consulta específica.
     */
    Optional<SignoVital> findByConsulta_IdConsulta(Long idConsulta);
}

