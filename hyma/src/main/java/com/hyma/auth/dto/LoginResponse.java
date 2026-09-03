package com.hyma.auth.dto;


import com.hyma.usuario.dto.UsuarioResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LoginResponse {
    /** Mensaje de confirmación del resultado del login */
    private String mensaje;

    /** Token de acceso JWT firmado */
    private String token;

    /** Tipo de token (por defecto 'Bearer') */
    @Builder.Default
    private String tokenType = "Bearer";

    /** Información del perfil del usuario autenticado */
    private UsuarioResponse usuario;
}