package com.hyma.clinica.repository;

import com.hyma.clinica.model.CategoriaDiagnostico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaDiagnosticoRepository extends JpaRepository<CategoriaDiagnostico, Long> {

    List<CategoriaDiagnostico> findAllByOrderByNombreAsc();

    Optional<CategoriaDiagnostico> findByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCase(String nombre);

    boolean existsByNombreIgnoreCaseAndIdCategoriaNot(String nombre, Long idCategoria);
}

