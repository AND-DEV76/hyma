package com.hyma.farmacia.repository;

import com.hyma.farmacia.model.Medicamento;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {

    boolean existsByCategoria_IdCategoriaMedicamento(Long idCategoriaMedicamento);

    boolean existsByCasaFarmaceutica_IdCasaFarmaceutica(Long idCasaFarmaceutica);

    @Query("""
        select m from Medicamento m
        left join fetch m.categoria
        left join fetch m.casaFarmaceutica
        where (:categoriaId is null or m.categoria.idCategoriaMedicamento = :categoriaId)
          and (:casaId is null or m.casaFarmaceutica.idCasaFarmaceutica = :casaId)
          and (:estado is null or m.estado = :estado)
          and lower(m.nombre) like lower(concat('%', coalesce(cast(:buscar as string), ''), '%'))
        order by m.nombre
        """)
    List<Medicamento> buscar(
            @Param("categoriaId") Long categoriaId,
            @Param("casaId") Long casaId,
            @Param("estado") Boolean estado,
            @Param("buscar") String buscar
    );
}
