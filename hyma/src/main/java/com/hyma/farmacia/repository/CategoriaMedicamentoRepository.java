package com.hyma.farmacia.repository;

import com.hyma.farmacia.model.CategoriaMedicamento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoriaMedicamentoRepository extends JpaRepository<CategoriaMedicamento, Long> {
    List<CategoriaMedicamento> findAllByOrderByNombreAsc();
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdCategoriaMedicamentoNot(String nombre, Long id);
}
