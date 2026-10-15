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

    List<SalidaMedicamento> findByTipoSalidaIgnoreCaseAndFechaSalidaBetweenOrderByFechaSalidaDesc(String tipoSalida, java.time.LocalDateTime inicio, java.time.LocalDateTime fin);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM SalidaMedicamento s WHERE UPPER(s.tipoSalida) IN :tipos AND s.fechaSalida BETWEEN :inicio AND :fin ORDER BY s.fechaSalida DESC")
    List<SalidaMedicamento> buscarPorTiposYFechas(@org.springframework.data.repository.query.Param("tipos") Collection<String> tipos, @org.springframework.data.repository.query.Param("inicio") java.time.LocalDateTime inicio, @org.springframework.data.repository.query.Param("fin") java.time.LocalDateTime fin);

    List<SalidaMedicamento> findByFechaSalidaBetweenOrderByFechaSalidaDesc(java.time.LocalDateTime inicio, java.time.LocalDateTime fin);

    List<SalidaMedicamento> findAllByOrderByFechaSalidaDesc();
}
