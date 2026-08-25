package com.hyma.usuario.dto;



import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UsuarioResponse {
    private Long idUsuario;
    private Long idRol;
    private String nombreRol;
    private String username;
    private Boolean estado;
    private LocalDateTime fechaCreacion;
}