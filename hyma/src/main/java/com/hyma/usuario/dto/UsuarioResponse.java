package com.hyma.usuario.dto;



import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class UsuarioResponse {
    private Long idUsuario;
    private Long idRol;
    private String nombreRol;
    private List<Long> idRoles;
    private List<String> roles;
    private String username;
    private String correo;
    private Boolean estado;
    private LocalDateTime fechaCreacion;
}