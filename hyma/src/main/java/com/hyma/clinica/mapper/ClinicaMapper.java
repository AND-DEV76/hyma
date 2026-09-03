package com.hyma.clinica.mapper;

import com.hyma.clinica.dto.CatalogoCie10Response;
import com.hyma.clinica.model.CatalogoCie10;
import org.springframework.stereotype.Component;

@Component
public class ClinicaMapper {
    public CatalogoCie10Response toCie10Response(CatalogoCie10 entity) {
        return CatalogoCie10Response.builder()
                .idCie10(entity.getIdCie10())
                .codigo(entity.getCodigo())
                .descripcion(entity.getDescripcion())
                .build();
    }
}
