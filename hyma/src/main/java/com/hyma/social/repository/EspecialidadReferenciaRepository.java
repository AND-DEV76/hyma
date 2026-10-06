package com.hyma.social.repository;

import com.hyma.social.model.EspecialidadReferencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface EspecialidadReferenciaRepository extends JpaRepository<EspecialidadReferencia, Long> {
    List<EspecialidadReferencia> findByActivoTrueOrderByNombreAsc();
    List<EspecialidadReferencia> findByNombreContainingIgnoreCaseAndActivoTrueOrderByNombreAsc(String buscar);

    @Query("""
        SELECT e FROM EspecialidadReferencia e
        WHERE e.activo = true
          AND (
            LOWER(e.nombre) LIKE LOWER(CONCAT('%', :buscar, '%'))
            OR (e.descripcion IS NOT NULL AND LOWER(e.descripcion) LIKE LOWER(CONCAT('%', :buscar, '%')))
          )
        ORDER BY e.nombre ASC
        """)
    List<EspecialidadReferencia> buscarPorNombreOdescripcion(@Param("buscar") String buscar);
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdEspecialidadNot(String nombre, Long idEspecialidad);
    Optional<EspecialidadReferencia> findByNombreIgnoreCase(String nombre);
}
