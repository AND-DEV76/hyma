package com.hyma.clinica.repository;

import com.hyma.clinica.model.ExamenFisico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ExamenFisicoRepository extends JpaRepository<ExamenFisico, Long> {
    Optional<ExamenFisico> findByConsulta_IdConsulta(Long idConsulta);
}

