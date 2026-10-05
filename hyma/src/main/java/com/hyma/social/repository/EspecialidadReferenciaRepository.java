package com.hyma.social.repository;

import com.hyma.social.model.EspecialidadReferencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EspecialidadReferenciaRepository extends JpaRepository<EspecialidadReferencia, Long> {
    List<EspecialidadReferencia> findByActivoTrueOrderByNombreAsc();
    List<EspecialidadReferencia> findByNombreContainingIgnoreCaseAndActivoTrueOrderByNombreAsc(String buscar);
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdEspecialidadNot(String nombre, Long idEspecialidad);
    Optional<EspecialidadReferencia> findByNombreIgnoreCase(String nombre);
}
