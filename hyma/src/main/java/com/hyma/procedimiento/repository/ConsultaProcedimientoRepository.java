package com.hyma.procedimiento.repository;

import com.hyma.procedimiento.model.ConsultaProcedimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ConsultaProcedimientoRepository extends JpaRepository<ConsultaProcedimiento, Long> {

    @Query("SELECT cp FROM ConsultaProcedimiento cp " +
           "JOIN FETCH cp.paciente " +
           "JOIN FETCH cp.procedimiento " +
           "LEFT JOIN FETCH cp.consulta " +
           "WHERE cp.consulta.idConsulta = :idConsulta")
    List<ConsultaProcedimiento> findByConsultaIdWithDetails(@Param("idConsulta") Long idConsulta);

    List<ConsultaProcedimiento> findByConsulta_IdConsulta(Long idConsulta);

    List<ConsultaProcedimiento> findByConsulta_IdConsultaIn(List<Long> idsConsultas);

    @Query("SELECT cp FROM ConsultaProcedimiento cp " +
           "JOIN FETCH cp.paciente " +
           "JOIN FETCH cp.procedimiento " +
           "LEFT JOIN FETCH cp.consulta c " +
           "LEFT JOIN FETCH c.medico " +
           "WHERE cp.estado = :estado " +
           "ORDER BY cp.fechaRegistro DESC")
    List<ConsultaProcedimiento> findByEstadoWithDetails(@Param("estado") String estado);

    @Query("SELECT cp FROM ConsultaProcedimiento cp " +
           "JOIN FETCH cp.paciente " +
           "JOIN FETCH cp.procedimiento " +
           "LEFT JOIN FETCH cp.consulta c " +
           "LEFT JOIN FETCH c.medico " +
           "ORDER BY cp.fechaRegistro DESC")
    List<ConsultaProcedimiento> findAllWithDetails();

    long countByEstado(String estado);

    List<ConsultaProcedimiento> findByFechaRegistroBetweenOrderByFechaRegistroAsc(LocalDateTime inicio, LocalDateTime fin);
}
