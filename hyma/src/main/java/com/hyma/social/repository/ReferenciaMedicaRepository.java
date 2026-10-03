package com.hyma.social.repository;

import com.hyma.social.model.ReferenciaMedica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReferenciaMedicaRepository extends JpaRepository<ReferenciaMedica, Long> {
    List<ReferenciaMedica> findByConsulta_IdConsulta(Long idConsulta);
    List<ReferenciaMedica> findByPaciente_IdPacienteOrderByFechaReferenciaDesc(Long idPaciente);

    @Query("""
        SELECT r.especialidad.nombre, COUNT(r)
        FROM ReferenciaMedica r
        WHERE EXTRACT(YEAR FROM r.fechaReferencia) = :anio
          AND EXTRACT(MONTH FROM r.fechaReferencia) = :mes
        GROUP BY r.especialidad.nombre
        HAVING COUNT(r) > 0
        ORDER BY COUNT(r) DESC, r.especialidad.nombre ASC
    """)
    List<Object[]> contarReferenciasPorMesYAño(@Param("anio") int anio, @Param("mes") int mes);

    long countByPaciente_IdPaciente(Long idPaciente);
}
