package com.hyma.social.repository;

import com.hyma.social.model.CentroReferencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CentroReferenciaRepository extends JpaRepository<CentroReferencia, Long> {
    List<CentroReferencia> findByEspecialidad_IdEspecialidadAndActivoTrue(Long idEspecialidad);
    List<CentroReferencia> findByActivoTrue();
}
