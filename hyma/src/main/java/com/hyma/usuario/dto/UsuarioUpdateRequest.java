package com.hyma.usuario.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioUpdateRequest {

    @NotNull(message = "El id_rol es obligatorio")
    private Long idRol;

    @NotBlank(message = "El username es obligatorio")
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    private String username;

    @NotNull(message = "El estado es obligatorio")
    private Boolean estado;

    // Opcional: Si se envía con valor, se actualiza el hash Argon2
    private String password;
}