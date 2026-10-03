package com.hyma.social.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EspecialidadReferenciaResponse {
    private Long idEspecialidad;
    private String nombre;
    private String descripcion;
    private Boolean activo;
}
