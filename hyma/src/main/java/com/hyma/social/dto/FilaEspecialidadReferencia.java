package com.hyma.social.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FilaEspecialidadReferencia {
    private String especialidad;
    private Long referencias;
    private Double porcentaje;
}
