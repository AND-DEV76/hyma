package com.hyma.farmacia.repository;

import com.hyma.farmacia.model.SalidaMedicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalidaMedicamentoRepository extends JpaRepository<SalidaMedicamento, Long> {

    Optional<SalidaMedicamento> findByConsulta_IdConsulta(Long idConsulta);

    List<SalidaMedicamento> findByConsulta_IdConsultaIn(Collection<Long> idsConsultas);

    List<SalidaMedicamento> findAllByOrderByFechaSalidaDesc();
}
