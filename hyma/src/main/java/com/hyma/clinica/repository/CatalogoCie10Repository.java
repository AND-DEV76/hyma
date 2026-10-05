package com.hyma.clinica.repository;

import com.hyma.clinica.model.CatalogoCie10;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CatalogoCie10Repository extends JpaRepository<CatalogoCie10, Long> {

    @Query("""
        SELECT c FROM CatalogoCie10 c
        LEFT JOIN FETCH c.categoria cat
        ORDER BY cat.nombre ASC NULLS LAST, c.descripcion ASC
        """)
    List<CatalogoCie10> findAllWithCategoria();

    @Query("""
        SELECT c FROM CatalogoCie10 c
        LEFT JOIN c.categoria cat
        WHERE (
            FUNCTION('TRANSLATE', LOWER(c.codigo), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU') LIKE FUNCTION('TRANSLATE', LOWER(CONCAT('%', :query, '%')), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU')
            OR FUNCTION('TRANSLATE', LOWER(c.descripcion), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU') LIKE FUNCTION('TRANSLATE', LOWER(CONCAT('%', :query, '%')), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU')
            OR (cat IS NOT NULL AND FUNCTION('TRANSLATE', LOWER(cat.nombre), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU') LIKE FUNCTION('TRANSLATE', LOWER(CONCAT('%', :query, '%')), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU'))
        )
        ORDER BY c.codigo ASC
        """)
    Page<CatalogoCie10> buscar(@Param("query") String query, Pageable pageable);

    @Query("""
        SELECT c FROM CatalogoCie10 c
        LEFT JOIN c.categoria cat
        WHERE cat.idCategoria = :idCategoria
          AND (
            FUNCTION('TRANSLATE', LOWER(c.codigo), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU') LIKE FUNCTION('TRANSLATE', LOWER(CONCAT('%', :query, '%')), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU')
            OR FUNCTION('TRANSLATE', LOWER(c.descripcion), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU') LIKE FUNCTION('TRANSLATE', LOWER(CONCAT('%', :query, '%')), 'áéíóúüÁÉÍÓÚÜ', 'aeiouuAEIOUU')
          )
        ORDER BY c.codigo ASC
        """)
    Page<CatalogoCie10> buscarPorCategoria(
            @Param("query") String query,
            @Param("idCategoria") Long idCategoria,
            Pageable pageable);

    boolean existsByCodigo(String codigo);
    boolean existsByCodigoAndIdCie10Not(String codigo, Long idCie10);
    boolean existsByCategoria_IdCategoria(Long idCategoria);
    long countByCategoria_IdCategoria(Long idCategoria);
}
