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
    private String mensaje;
    private UsuarioResponse usuario;
}