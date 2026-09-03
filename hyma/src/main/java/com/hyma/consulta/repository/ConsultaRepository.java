package com.hyma.consulta.repository;

import com.hyma.consulta.model.Consulta;
import com.hyma.recepcion.model.Paciente;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConsultaRepository extends JpaRepository<Consulta, Long> {

    Optional<Consulta> findTopByPacienteOrderByFechaConsultaDesc(Paciente paciente);

}