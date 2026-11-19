package com.hyma.clinica.repository;

import com.hyma.clinica.model.RecetaExterna;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecetaExternaRepository extends JpaRepository<RecetaExterna, Long> {
    List<RecetaExterna> findByConsultaIdConsulta(Long idConsulta);
    List<RecetaExterna> findByConsultaIdConsultaOrderByFechaRegistroAsc(Long idConsulta);
}
