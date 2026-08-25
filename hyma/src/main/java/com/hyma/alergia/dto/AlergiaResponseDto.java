package com.hyma.alergia.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AlergiaResponseDto {

    private Long idAlergia;
    private String nombre;
}