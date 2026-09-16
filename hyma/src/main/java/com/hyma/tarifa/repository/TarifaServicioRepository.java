package com.hyma.tarifa.repository;

import com.hyma.tarifa.model.TarifaServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TarifaServicioRepository extends JpaRepository<TarifaServicio, Long> {

    Optional<TarifaServicio> findByNombreIgnoreCase(String nombre);

    List<TarifaServicio> findByActivoTrueOrderByNombreAsc();
}
