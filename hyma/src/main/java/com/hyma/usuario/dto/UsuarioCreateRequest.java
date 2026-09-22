package com.hyma.usuario.dto;


import jakarta.validation.constraints.NotBlank;

import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.List;

@Data
public class UsuarioCreateRequest {

    // Soporta lista de roles o un rol único por compatibilidad
    private List<Long> idRoles;
    private Long idRol;

    private String correo;

    @NotBlank(message = "El username es obligatorio")
    @Size(min = 3, max = 50, message = "El username debe tener entre 3 y 50 caracteres")
    private String username;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String password;
}