package com.hyma.clinica.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CatalogoCie10Response {
    private Long idCie10;
    private String codigo;
    private String descripcion;
    private Long idCategoria;
    private String categoriaNombre;
}
