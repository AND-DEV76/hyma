package com.hyma.usuario.mapper;


import com.hyma.usuario.dto.UsuarioResponse;
import com.hyma.usuario.model.Rol;
import com.hyma.usuario.model.Usuario;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
public class UsuarioMapper {

    public UsuarioResponse toResponse(Usuario usuario) {
        if (usuario == null) return null;

        UsuarioResponse response = new UsuarioResponse();
        response.setIdUsuario(usuario.getIdUsuario());
        response.setUsername(usuario.getUsername());
        response.setCorreo(usuario.getCorreo());
        response.setEstado(usuario.getEstado());
        response.setFechaCreacion(usuario.getFechaCreacion());

        if (usuario.getRoles() != null && !usuario.getRoles().isEmpty()) {
            List<Long> idRoles = usuario.getRoles().stream().map(Rol::getIdRol).toList();
            List<String> roles = usuario.getRoles().stream().map(Rol::getNombre).toList();
            response.setIdRoles(idRoles);
            response.setRoles(roles);

            Rol primer = usuario.getRoles().iterator().next();
            response.setIdRol(primer.getIdRol());
            response.setNombreRol(primer.getNombre());
        } else {
            response.setIdRoles(Collections.emptyList());
            response.setRoles(Collections.emptyList());
            response.setIdRol(null);
            response.setNombreRol("SIN_ROL");
        }
        return response;
    }
}