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
            FUNCTION('TRANSLATE', LOWER(e.nombre), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU') LIKE FUNCTION('TRANSLATE', LOWER(CONCAT('%', :buscar, '%')), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU')
            OR (e.descripcion IS NOT NULL AND FUNCTION('TRANSLATE', LOWER(e.descripcion), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU') LIKE FUNCTION('TRANSLATE', LOWER(CONCAT('%', :buscar, '%')), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU'))
          )
        ORDER BY e.nombre ASC
        """)
    List<EspecialidadReferencia> buscarPorNombreOdescripcion(@Param("buscar") String buscar);
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsByNombreIgnoreCaseAndIdEspecialidadNot(String nombre, Long idEspecialidad);
    Optional<EspecialidadReferencia> findByNombreIgnoreCase(String nombre);
}
