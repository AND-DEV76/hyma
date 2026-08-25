package com.hyma.doctor.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.hyma.doctor.model.Medico;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Long> {
    boolean existsByUsuarioIdUsuario(Long idUsuario);
    boolean existsByUsuarioIdUsuarioAndIdMedicoNot(Long idUsuario, Long idMedico);
}