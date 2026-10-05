package com.hyma.social.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CentroReferenciaRequest {

    @NotNull(message = "La especialidad es obligatoria")
    private Long idEspecialidad;

    @Size(max = 150, message = "La institución no puede exceder 150 caracteres")
    private String institucion;

    @Size(max = 150, message = "El nombre del médico no puede exceder 150 caracteres")
    private String nombreMedico;

    @NotNull(message = "El precio de consulta es obligatorio")
    @DecimalMin(value = "0.0", inclusive = true, message = "El precio no puede ser negativo")
    private BigDecimal precioConsulta;

    @NotBlank(message = "La dirección es obligatoria")
    @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
    private String direccion;

    @Size(max = 150, message = "Los días de atención no pueden exceder 150 caracteres")
    private String diasAtencion;

    @Size(max = 50, message = "El teléfono no puede exceder 50 caracteres")
    private String telefono;
}
