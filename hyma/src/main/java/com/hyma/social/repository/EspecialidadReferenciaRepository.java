package com.hyma.social.repository;

import com.hyma.social.model.EspecialidadReferencia;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EspecialidadReferenciaRepository extends JpaRepository<EspecialidadReferencia, Long> {
    List<EspecialidadReferencia> findByActivoTrueOrderByNombreAsc();
    List<EspecialidadReferencia> findByNombreContainingIgnoreCaseAndActivoTrueOrderByNombreAsc(String buscar);
}
