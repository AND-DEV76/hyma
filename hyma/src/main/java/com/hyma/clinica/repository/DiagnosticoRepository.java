package com.hyma.clinica.repository;

import com.hyma.clinica.model.Diagnostico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DiagnosticoRepository extends JpaRepository<Diagnostico, Long> {
    List<Diagnostico> findByConsulta_IdConsulta(Long idConsulta);
}

