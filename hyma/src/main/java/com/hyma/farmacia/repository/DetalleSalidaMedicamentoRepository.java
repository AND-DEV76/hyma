package com.hyma.farmacia.repository;

import com.hyma.farmacia.model.DetalleSalidaMedicamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface DetalleSalidaMedicamentoRepository extends JpaRepository<DetalleSalidaMedicamento, Long> {

    List<DetalleSalidaMedicamento> findBySalida_IdSalida(Long idSalida);

    List<DetalleSalidaMedicamento> findBySalida_IdSalidaIn(Collection<Long> idsSalidas);
}
