package com.hyma.farmacia.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicamentoRequest {

    private Long idCategoriaMedicamento;
    private Long idCasaFarmaceutica;

    @NotBlank(message = "El nombre del medicamento es obligatorio")
    @Size(max = 150, message = "El nombre no puede superar 150 caracteres")
    private String nombre;

    @Size(max = 100, message = "La presentación no puede superar 100 caracteres")
    private String presentacion;

    @Size(max = 100, message = "La concentración no puede superar 100 caracteres")
    private String concentracion;

    @Builder.Default
    private Boolean estado = true;
}
