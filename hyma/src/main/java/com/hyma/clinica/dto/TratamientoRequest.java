package com.hyma.clinica.dto;

import jakarta.validation.Valid;
import lombok.Data;
import java.util.List;

@Data
public class TratamientoRequest {
    private String observaciones;
    @Valid
    private List<DetalleTratamientoRequest> detalles;
}
