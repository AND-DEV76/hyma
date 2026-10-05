package com.hyma.social.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EspecialidadConContactosResponse {
    private Long idEspecialidad;
    private String nombre;
    private String descripcion;
    private Boolean activo;
    @Builder.Default
    private List<CentroReferenciaResponse> contactos = new ArrayList<>();
}
