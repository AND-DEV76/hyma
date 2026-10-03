package com.hyma.recepcion.repository;

import com.hyma.recepcion.model.Paciente;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {

    @Query("""
        SELECT p
        FROM Paciente p
        WHERE LOWER(p.nombres) LIKE LOWER(CONCAT('%', :buscar, '%'))
           OR LOWER(p.apellidos) LIKE LOWER(CONCAT('%', :buscar, '%'))
           OR LOWER(COALESCE(p.telefono, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
        ORDER BY p.apellidos ASC, p.nombres ASC
        """)
    List<Paciente> buscar(@Param("buscar") String buscar);

    @Query("""
        SELECT p
        FROM Paciente p
        ORDER BY p.fechaRegistro DESC, p.idPaciente DESC
    """)
    List<Paciente> findTopRecientes(Pageable pageable);

    @Query("""
        SELECT p
        FROM Paciente p
        WHERE LOWER(p.nombres) LIKE LOWER(CONCAT('%', :buscar, '%'))
           OR LOWER(p.apellidos) LIKE LOWER(CONCAT('%', :buscar, '%'))
           OR LOWER(COALESCE(p.telefono, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
           OR LOWER(COALESCE(p.comunidad, '')) LIKE LOWER(CONCAT('%', :buscar, '%'))
        ORDER BY p.apellidos ASC, p.nombres ASC
    """)
    List<Paciente> buscarPaginado(@Param("buscar") String buscar, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT p
        FROM Paciente p
        WHERE p.idPaciente = :id
        """)
    Optional<Paciente> findByIdForUpdate(@Param("id") Long id);
}