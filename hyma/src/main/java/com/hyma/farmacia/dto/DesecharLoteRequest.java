package com.hyma.farmacia.dto;

import jakarta.validation.constraints.Min;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DesecharLoteRequest {

    @Min(value = 1, message = "La cantidad a desechar debe ser al menos 1")
    private Integer cantidad;

    private String motivo;
}
