package com.hyma.usuario.mapper;


import com.hyma.usuario.dto.UsuarioResponse;
import com.hyma.usuario.model.Usuario;
import org.springframework.stereotype.Component;

@Component
public class UsuarioMapper {

    public UsuarioResponse toResponse(Usuario usuario) {
        if (usuario == null) return null;

        UsuarioResponse response = new UsuarioResponse();
        response.setIdUsuario(usuario.getIdUsuario());
        response.setIdRol(usuario.getRol().getIdRol());
        response.setNombreRol(usuario.getRol().getNombre());
        response.setUsername(usuario.getUsername());
        response.setEstado(usuario.getEstado());
        response.setFechaCreacion(usuario.getFechaCreacion());
        return response;
    }
}