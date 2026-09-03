package com.hyma.farmacia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParametroFarmaciaRequest {

    @NotBlank(message = "El valor es obligatorio")
    @Size(max = 255, message = "El valor no puede superar 255 caracteres")
    private String valor;

    @Size(max = 255, message = "La descripción no puede superar 255 caracteres")
    private String descripcion;
}
