package com.hyma.farmacia.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogoFarmaciaResponse {
    private Long id;
    private String nombre;
}
