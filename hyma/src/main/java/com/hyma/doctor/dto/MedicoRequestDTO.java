package com.hyma.doctor.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor  // <--- IMPORTANTE: Jackson lo necesita para leer el JSON
@AllArgsConstructor
public class MedicoRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder los 100 caracteres")
    private String nombres;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100, message = "El apellido no puede exceder los 100 caracteres")
    private String apellidos;

    @Size(max = 100, message = "La especialidad no puede exceder los 100 caracteres")
    private String especialidad;

    @Size(max = 20, message = "El teléfono no puede exceder los 20 caracteres")
    private String telefono;

    @Email(message = "Debe proporcionar un correo electrónico válido")
    @Size(max = 100, message = "El correo no puede exceder los 100 caracteres")
    private String correo;

    private Long idUsuario; // Opcional o asignable según negocio
}