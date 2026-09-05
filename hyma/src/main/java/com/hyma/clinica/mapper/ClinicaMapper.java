package com.hyma.clinica.mapper;

import com.hyma.clinica.dto.CatalogoCie10Response;
import com.hyma.clinica.model.CatalogoCie10;
import com.hyma.clinica.dto.CategoriaDiagnosticoResponse;
import com.hyma.clinica.model.CategoriaDiagnostico;
import org.springframework.stereotype.Component;

@Component
public class ClinicaMapper {
    public CatalogoCie10Response toCie10Response(CatalogoCie10 entity) {
        Long idCat = (entity.getCategoria() != null) ? entity.getCategoria().getIdCategoria() : null;
        String nombreCat = (entity.getCategoria() != null) ? entity.getCategoria().getNombre() : null;

        return CatalogoCie10Response.builder()
                .idCie10(entity.getIdCie10())
                .codigo(entity.getCodigo())
                .descripcion(entity.getDescripcion())
                .idCategoria(idCat)
                .categoriaNombre(nombreCat)
                .build();
    }

    public CategoriaDiagnosticoResponse toCategoriaResponse(CategoriaDiagnostico entity, Long totalDiagnosticos) {
        return CategoriaDiagnosticoResponse.builder()
                .idCategoria(entity.getIdCategoria())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .totalDiagnosticos(totalDiagnosticos != null ? totalDiagnosticos : 0L)
                .build();
    }
}
