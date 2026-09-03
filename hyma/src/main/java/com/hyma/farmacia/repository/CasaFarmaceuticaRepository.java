package com.hyma.farmacia.repository;

import com.hyma.farmacia.model.CasaFarmaceutica;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CasaFarmaceuticaRepository extends JpaRepository<CasaFarmaceutica, Long> {
    List<CasaFarmaceutica> findAllByOrderByNombreAsc();
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdCasaFarmaceuticaNot(String nombre, Long id);
}
