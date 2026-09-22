package com.hyma.usuario.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class UsuarioUpdateRequest {

    // Soporta lista de roles o un rol único por compatibilidad
    private List<Long> idRoles;
    private Long idRol;

    private String correo;

    @NotBlank(message = "El username es obligatorio")
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    private String username;

    @NotNull(message = "El estado es obligatorio")
    private Boolean estado;

    // Opcional: Si se envía con valor, se actualiza el hash Argon2
    private String password;
}