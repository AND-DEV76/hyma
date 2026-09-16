package com.hyma.consulta.repository;

import com.hyma.consulta.model.Consulta;
import com.hyma.recepcion.model.Paciente;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    Optional<Consulta> findTopByPacienteOrderByFechaConsultaDesc(Paciente paciente);

    List<Consulta> findByFechaConsultaBetweenOrderByFechaConsultaAsc(LocalDateTime start, LocalDateTime end);

    @Query("SELECT c.paciente.idPaciente, MIN(c.fechaConsulta) FROM Consulta c GROUP BY c.paciente.idPaciente")
    List<Object[]> findMinFechaConsultaPorPaciente();
}